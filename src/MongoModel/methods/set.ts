import MongoModel from '../MongoModel.js';

function set(this: MongoModel, data: Record<string, any>): MongoModel {
    if (!this.modelData) this.modelData = {};
    this._modelDataBeforeSave = this.data(true);
    console.log('1')
    // Handle undefined values by deleting keys from modelData
    const updatedModelData = { ...this.modelData };
    
    for (const key in data) {
        if (data[key] === undefined) {
            delete updatedModelData[key];
        } else {
            updatedModelData[key] = data[key];
        }
    }

    this.validate(updatedModelData);
    this.modelData = updatedModelData;

    return this;
}

export default set;