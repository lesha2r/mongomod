import _ from "lodash";
import { ObjectId } from "mongodb";
function clearBySchema() {
    if (!this.schema)
        return this;
    const schema = this.schema.schema;
    if (Object.keys(schema).length === 0)
        return this;
    if (!this.modelData)
        return this;
    const currentModelData = _.cloneDeep(this.modelData);
    let newModelData = {};
    const _id = currentModelData._id instanceof ObjectId ? currentModelData._id : new ObjectId(currentModelData._id);
    for (let key in currentModelData) {
        if (key in schema === false)
            delete currentModelData[key];
    }
    this.modelData = newModelData;
    if (_id)
        this.modelData._id = _id;
    return this;
}
export default clearBySchema;
