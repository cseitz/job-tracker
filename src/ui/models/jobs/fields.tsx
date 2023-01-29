import Status from './fields/status';
import Applied from './fields/applied';
import EditableText from './fields/text';

export const JobField = {
    ...Status,
    ...Applied,
    ...EditableText,
}