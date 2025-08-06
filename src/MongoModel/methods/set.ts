import MongoModel from '../MongoModel.js';

function set(this: MongoModel, data: Record<string, any>): MongoModel {
    if (!this.modelData) this.modelData = {};
    this._modelDataBeforeSave = this.data(true);

    // suggest realization
    const updatedModelData = { ...this.modelData, ...data };

    this.validate(updatedModelData);
    this.modelData = updatedModelData;

    return this;
}

export default set;