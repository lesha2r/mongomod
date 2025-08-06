function set(data) {
    if (!this.modelData)
        this.modelData = {};
    this._modelDataBeforeSave = this.data(true);
    const updatedModelData = { ...this.modelData, ...data };
    this.validate(updatedModelData);
    this.modelData = updatedModelData;
    return this;
}
export default set;
