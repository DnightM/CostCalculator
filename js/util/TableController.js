class TableController {
    constructor(dataTree, tableElementSelector) {
        this.dataTree = dataTree;
        this.tableElementSelector = tableElementSelector;
        this.table = null;
        this.urlDataManager = new UrlDataManager();
    }

    show(id = null) {
        const {columns, data} = this.toTabulatorData(id);

        if (this.table) {
            this.table.setColumns(columns);
            this.table.setData(data);
        } else {
            this.table = new Tabulator(this.tableElementSelector, {
                data: data,
                layout: "fitColumns",
                columns: columns,
            });
            // this.table.on("rowDoubleClick", (e, row) => {
            //     console.log("clicked row:", row.getData());
            // });

            this.table.on("cellEdited", (cell) => {
                const rowData = cell.getRow().getData();

                const field = cell.getField();
                const value = cell.getValue();
                const node = this.dataTree.getNodeById(rowData.id);
                if (!node) return;
                try {
                    if (field === 'name') node.name = value;
                    else if (field === 'salesPrice') node.salesPrice = value;
                    else if (field === 'unitCost') node.cost = value;
                    else if (field === 'quantity') {
                        const parentNode = this.dataTree.getNodeById(this.currentParentId);
                        if (parentNode && parentNode.child && parentNode.child[rowData.id]) {
                            parentNode.child[rowData.id].quantity = value;
                        }
                    }
                } catch (e) {
                    alert(`수정 중 오류 발생: ${e.message}`);
                }
            });
        }
    }

    toTabulatorData(id = null) {
        const data = [];
        const columns = this.getColumns(id);

        if (id) {
            const parent = this.dataTree.getNodeById(id);
            if (!parent || !parent.child) return {columns, data};

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

    getColumns(id = null) {
        return id
            ? [
                {title: "재료", field: "name", editor: "input"},
                {title: "수량", field: "quantity", editor: "number"},
                {title: "원가", field: "unitCost", editor: "number"}
            ]
            : [
                {title: "메뉴", field: "name", editor: "input"},
                {title: "판매가", field: "salesPrice", editor: "number"},
                {title: "원가", field: "unitCost"},
                {title: "수익", field: "benefit"}
            ];
    }

    /**
     * 테이블에 새 행 추가
     * 현재 parentId 기준으로 재료 추가하거나, 최상단 메뉴 추가
     */
    insertRow(defaults = {}) {
        const newId = this.dataTree.getNextId();
        let newNode;

        if (this.currentParentId) {
            // 재료 추가
            newNode = this.dataTree.createMaterial(defaults.name || "신규재료", defaults.unitCost || 0);
            this.dataTree.addChild(this.currentParentId, newNode.id, defaults.quantity || 1);
        } else {
            // 메뉴 추가
            newNode = this.dataTree.createItem(defaults.name || "신규메뉴", defaults.salesPrice || 0);
        }

        this.show(this.currentParentId);
    }

    /**
     * 선택된 행 삭제
     * DataTree에서도 제거
     */
    deleteRow() {
        const selectedRows = this.table.getSelectedData();
        if (selectedRows.length === 0) return;

        for (const row of selectedRows) {
            const id = row.id;
            if (this.currentParentId) {
                // 자식에서 제거
                this.dataTree.removeChild(this.currentParentId, id);
            } else {
                // 전체에서 제거
                this.dataTree.removeNode(id);
            }
        }

        this.show(this.currentParentId);
    }
}
