class TableController {
    constructor(dataTree, tableElementSelector) {
        this.dataTree = dataTree;
        this.tableElementSelector = tableElementSelector;
        this.table = null;
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
                    quantity,
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
                    });
                }
            }
        }

        return {columns, data};
    }

    getColumns(id = null) {
        return id
            ? [
                {title: "ID", field: "id"},
                {title: "이름", field: "name", editor: "input"},
                {title: "수량", field: "quantity", editor: "number"},
                {title: "원가", field: "unitCost", editor: "number"}
            ]
            : [
                {title: "ID", field: "id"},
                {title: "이름", field: "name", editor: "input"},
                {title: "판매가", field: "salesPrice", editor: "number"},
                {title: "원가", field: "unitCost", editor: "number"}
            ];
    }
}
