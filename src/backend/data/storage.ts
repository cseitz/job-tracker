// @ts-ignore
import { TextFile } from 'lowdb/node';
import { Adapter } from 'lowdb';
import SuperJSON from 'superjson';

export class SuperJSONFile<T> implements Adapter<T> {
    adapter: TextFile

    constructor(filename: string) {
        this.adapter = new TextFile(filename)
    }

    async read(): Promise<T | null> {
        const data = await this.adapter.read()
        if (data === null) {
            return null
        } else {
            return SuperJSON.parse(data) as T
        }
    }

    write(obj: T): Promise<void> {
        const serialized = SuperJSON.serialize(obj);
        return this.adapter.write(JSON.stringify(serialized, null, 2))
    }
}