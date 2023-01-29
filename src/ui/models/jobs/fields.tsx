import Status from './fields/status';
import Applied from './fields/applied';
import Updated from './fields/updated';
import EditableText from './fields/text';

export const JobField = {
    ...Status,
    ...Applied,
    ...Updated,
    ...EditableText,
}
