import { Low } from 'lowdb';
import { SuperJSONFile } from './storage';
import { JobData } from './models/job';
import { env } from '../../utils/env';
import { mkdirSync } from 'fs';

type DatabaseSchema = {
    indexes: { [key: string]: number }
    jobs: JobData[]
}


mkdirSync(process.cwd() + '/data', { recursive: true });
const lowdb = new Low(new SuperJSONFile<DatabaseSchema>(`${process.cwd()}/data/${env.DATASET}.json`));
export const ready = new Promise<typeof lowdb>(async resolve => {
    await lowdb.read();
    lowdb.data ||= {
        indexes: {},
        jobs: []
    }
    resolve(db);
});


let pendingSaves = 0;
let pendingSave: any;
const _save = function() {
    pendingSaves = 0;
    if (pendingSave) {
        clearTimeout(pendingSave);
    }
    lowdb.write();
}
const save = function () {
    pendingSaves++;
    if (pendingSave) {
        clearTimeout(pendingSave);
    }
    if (++pendingSaves <= 20) {
        pendingSave = setTimeout(_save, 1000);
    } else {
        _save();
    }
}

export const db = Object.assign(lowdb, {
    ready,
    save,
})

