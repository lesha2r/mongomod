import MongoModel from '../MongoModel.js';
declare function validate(this: MongoModel, data?: {
    [key: string]: any;
} | null): any;
export default validate;
