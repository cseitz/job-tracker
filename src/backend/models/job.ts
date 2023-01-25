import { jobData } from '../data/models/job';
import { Model } from './_base';


export class Job extends Model({
    schema: jobData,
    collection: 'jobs'
}) {




}

