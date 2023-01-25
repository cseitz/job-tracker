import { z } from 'zod';
import { db } from '../data';
import { FieldPath, FieldPathValue } from 'react-hook-form';
import { get, set } from 'lodash';




type ModelConfig = {
    schema?: z.ZodObject<any>;
    collection: string;
    autoincrement?: boolean;
}

// @ts-ignore
class BaseModel<Config extends ModelConfig, Data extends BaseModelData = z.infer<Config['schema']>> {
    public data: Data;

    constructor(config: ModelConfig, id: Data['id'])
    constructor(config: ModelConfig, data: Omit<Data, 'id'>)
    constructor(public config: ModelConfig, input) {
        if (typeof input === 'string' || typeof input === 'number') {
            this.data = db?.data?.[this.config.collection]?.find(o => o.id === input);
            if (!this.data) {
                throw new Error(`Model: Cannot find ${this.constructor.name} ${input}!`)
            }
        } else {
            this.data = { ...input };
        }
    }

    async save(): Promise<Data> {
        const { collection, autoincrement = true, schema } = this.config;
        await db.ready;
        if (!db.data) {
            throw new Error(`Model: Database not ready!`);
        }
        if (!this.data?.created) {
            this.data.created = new Date();
        }
        let increment = false;
        if (autoincrement && !this.data.id) {
            const indexes = db.data.indexes || {};
            if (!(collection in indexes)) {
                db.data.indexes = {
                    ...indexes,
                    [collection]: 0,
                }
            }
            this.data.id = -1;
            increment = true;
        }
        this.data.updated = new Date();
        // @ts-ignore
        // this.data.applied = new Date();
        const result = schema?.parse(this.data);
        if (result) {
            if (increment) {
                result.id = ++db.data.indexes[collection];
            }
            if (db.data[collection].find(o => o.id === result.id)) {
                Object.assign(db.data[collection], result);
            } else {
                db.data[collection].push(result);
            }
            db.save();
            return result as any;
        }
        throw new Error(`Model: Validation failed`);
    }

    get<K extends FieldPath<Data>>(field: K): FieldPathValue<Data, K> {
        return get(this.data, field) as any;
    }

    set<K extends Exclude<FieldPath<Data>, 'created' | 'updated'>>(field: K, value: FieldPathValue<Data, K>): Data {
        return set(this.data, field, value) as any;
    }

    async delete() {
        this.data.deleted = new Date();
        return Boolean(await this.save());
    }

    async undo(action: 'delete') {
        if (action === 'delete') {
            delete this.data.deleted;
            return Boolean(await this.save());
        }
    }
}

export function Model<Config extends ModelConfig>(config: Config) {
    // @ts-ignore
    type Data = z.infer<Config['schema']>;
    return class extends BaseModel<Config> {
        constructor(id: number) // @ts-ignore
        constructor(data: Omit<Data, keyof BaseModelData>)
        constructor(input) {
            super(config, input);
        }

        static async findOne(filter?: (doc: Data) => boolean): Promise<Data | null> {
            await db.ready;
            let results = db.data?.[config.collection] || [];
            results = results.filter(o => !o.deleted);
            if (filter) return results.find(filter) || null;
            return results.find(o => true) || null;
        }

        static async find(filter?: (doc: Data) => boolean): Promise<Data[]> {
            await db.ready;
            let results = db.data?.[config.collection] || [];
            results = results.filter(o => !o.deleted);
            if (filter) return results.filter(filter);
            return results;
        }
    }
}