class AutoSaveDataTree extends DataTree {
    constructor() {
        super();
        this._urlManager = new UrlDataManager();
    }

    /**
     * 노드 생성 후 자동 저장
     */
    createItem(name, salesPrice) {
        const item = super.createItem(name, salesPrice);
        this._autoSave();
        return item;
    }

    createMaterial(name, quantity, cost) {
        const mat = super.createMaterial(name, quantity, cost);
        this._autoSave();
        return mat;
    }

    insertChild(parentName, childName, quantity) {
        super.insertChild(parentName, childName, quantity);
        this._autoSave();
    }

    removeChild(parentName, childName) {
        super.removeChild(parentName, childName);
        this._autoSave();
    }

    removeNode(name) {
        super.removeNode(name);
        this._autoSave();
    }

    /**
     * URL에서 복원
     */
    loadFromUrl() {
        const data = this._urlManager.loadFromUrl();
        const restored = DataTree.from(data);
        this._nodes = restored.nodes;
    }

    /**
     * 내부 상태를 URL에 자동 저장
     */
    _autoSave() {
        const json = JSON.parse(JSON.stringify(this));
        this._urlManager.saveToUrl(json);
    }
}
