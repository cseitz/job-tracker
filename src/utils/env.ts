import { cleanEnv, str } from 'envalid';
import * as dotenv from 'dotenv';

dotenv.config();
dotenv.config({
    override: true,
    path: process.cwd() + '/.env.local',
});


export const env = cleanEnv(process.env, {
    DATASET: str({
        default: 'prod',
    }),
})

