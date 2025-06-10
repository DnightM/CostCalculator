class AutoSaveTableController extends TableController {
    constructor(dataTree, tableElementSelector) {
        super(dataTree, tableElementSelector);
        this.urlDataManager = new UrlDataManager();
        this.table.on("cellEdited", () => this.save());
    }

    insertRow(defaults = {}) {
        super.insertRow(defaults);
        this.save();
    }

    deleteRow() {
        super.deleteRow();
        this.save();
    }

    save() {
        console.log('save')
        this.urlDataManager.saveToUrl(this.dataTree.toObject());
    }
}
