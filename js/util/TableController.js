class TableController {
    constructor(dataTree, tableElementSelector) {
        this.dataTree = dataTree;
        this.tableElementSelector = tableElementSelector;
        this.selectedRow = null;
        this.table = null;
        this.currentParentId = null;

        this.FIELD = {
            NAME: 'name',
            SALES_PRICE: 'salesPrice',
            UNIT_COST: 'unitCost',
            QUANTITY: 'quantity',
        };
    }

    /**
     * 테이블을 렌더링함
     * @param {number|null} id - 부모 노드 ID (없으면 전체 메뉴 목록)
     */
    show(id = null) {
        this.currentParentId = id;
        const {columns, data} = this.toTabulatorData(id);

        if (this.table) {
            this.table.setColumns(columns);
            this.table.setData(data);
        } else {
            this.table = new Tabulator(this.tableElementSelector, {
                data: data,
                layout: "fitColumns",
                columns: columns,
                selectable: true
            });
            this.table.on("rowClick", (e, row) => {
                this.selectedRow = row.getData();
            });
            this.table.on("cellEdited", (cell) => {
                const rowData = cell.getRow().getData();
                const field = cell.getField();
                const value = cell.getValue();
                const node = this.dataTree.getNodeById(rowData.id);
                if (!node) return;

                try {
                    switch (field) {
                        case this.FIELD.NAME:
                            node.name = value;
                            break;
                        case this.FIELD.SALES_PRICE:
                            node.salesPrice = value;
                            cell.getRow().update({benefit: node.salesPrice - node.unitCost});
                            break;
                        case this.FIELD.UNIT_COST:
                            node.cost = value;
                            cell.getRow().update({benefit: (node.salesPrice || 0) - (node.unitCost || 0)});
                            break;
                        case this.FIELD.QUANTITY:
                            const parentNode = this.dataTree.getNodeById(this.currentParentId);
                            if (parentNode?.child?.[rowData.id]) {
                                parentNode.child[rowData.id].quantity = value;
                            }
                            break;
                    }
                } catch (e) {
                    alert(`수정 중 오류 발생: ${e.message}`);
                }
            });
        }
    }

    /**
     * Tabulator용 데이터와 컬럼 정의 반환
     * @param {number|null} id - 부모 노드 ID
     * @returns {{columns: array, data: array}}
     */
    toTabulatorData(id = null) {
        const data = [];
        const columns = this.getColumns(id);

        if (id) {
            const parent = this.dataTree.getNodeById(id);
            if (!parent?.child) return {columns, data};

            for (const childId in parent.child) {
                const {node, quantity} = parent.child[childId];
                data.push({
                    id: Number(childId),
                    name: node.name,
                    quantity: quantity,
                    unitCost: node.unitCost,
                });
            }
        } else {
            for (const id in this.dataTree.nodes) {
                const node = this.dataTree.nodes[id];
                if (node.type === 'Item') {
                    data.push({
                        id: Number(id),
                        name: node.name,
                        salesPrice: node.salesPrice,
                        unitCost: node.unitCost,
                        benefit: node.salesPrice - node.unitCost,
                    });
                }
            }
        }

        return {columns, data};
    }

    /**
     * 테이블 컬럼 정의 반환
     * @param {number|null} id - 부모 노드 ID
     * @returns {array} 컬럼 정의 배열
     */
    getColumns(id = null) {
        return id
            ? [
                {title: "재료", field: this.FIELD.NAME, editor: "input"},
                {title: "수량", field: this.FIELD.QUANTITY, editor: "number"},
                {title: "원가", field: this.FIELD.UNIT_COST, editor: "number"},
            ]
            : [
                {title: "메뉴", field: this.FIELD.NAME, editor: "input"},
                {title: "판매가", field: this.FIELD.SALES_PRICE, editor: "number"},
                {title: "원가", field: this.FIELD.UNIT_COST},
                {title: "수익", field: "benefit"},
            ];
    }

    /**
     * 새 행 추가 (메뉴 또는 재료)
     * @param {object} defaults - 기본값 {name, unitCost, quantity, salesPrice}
     */
    insertRow(defaults = {}) {
        let newNode;

        if (this.currentParentId) {
            newNode = this.dataTree.createMaterial(
                defaults.name || "신규재료",
                defaults.unitCost || 0
            );
            this.dataTree.insertChild(
                this.currentParentId,
                newNode.id,
                defaults.quantity || 1
            );
        } else {
            newNode = this.dataTree.createItem(
                defaults.name || "신규메뉴",
                defaults.salesPrice || 0
            );
        }

        this.show(this.currentParentId);
    }

    modifyRow() {
        const row = this.selectedRow;
        this.selectedRow = null;
        if (!row) {
            alert("수정할 행을 먼저 선택해주세요.");
            return false;
        }
        const id = row.id;
        this.show(id);
        return true;
    }

    /**
     * 선택된 행 삭제
     */
    deleteRow() {
        const row = this.selectedRow;
        this.selectedRow = null;
        if (!row) {
            alert("삭제할 행을 먼저 선택해주세요.");
            return;
        }
        const id = row.id;
        const ok = confirm(`'${row.name}'을(를) 삭제할까요?`);
        if (!ok) return;
        if (this.currentParentId) {
            this.dataTree.removeChild(this.currentParentId, id);
        } else {
            this.dataTree.removeNode(id);
        }
        this.show(this.currentParentId);
    }
}
