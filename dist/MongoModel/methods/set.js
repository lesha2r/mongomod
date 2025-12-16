function set(data) {
    if (!this.modelData)
        this.modelData = {};
    const updatedModelData = { ...this.modelData };
    for (const key in data) {
        if (data[key] === undefined) {
            delete updatedModelData[key];
        }
        else {
            updatedModelData[key] = data[key];
        }
    }
    this.modelData = updatedModelData;
    return this;
}
export default set;
