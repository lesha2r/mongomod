function set(data) {
    if (!this.modelData)
        this.modelData = {};
    this._modelDataBeforeSave = this.data(true);
    const updatedModelData = { ...this.modelData };
    for (const key in data) {
        if (data[key] === undefined) {
            delete updatedModelData[key];
        }
        else {
            updatedModelData[key] = data[key];
        }
    }
    this.validate(updatedModelData);
    this.modelData = updatedModelData;
    return this;
}
export default set;
