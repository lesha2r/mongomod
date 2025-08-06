import MongoModel from "../MongoModel.js";

function init(this: MongoModel, data: Record<string, any>): MongoModel {
    this.validate(data);

    this.modelData = data;

    return this;
}

export default init;