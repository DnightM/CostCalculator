if (typeof IdManager === 'undefined') {
    throw new Error('IdManager class is required but not defined.');
}

class DataTree {
    _nodes = {}; // id -> Node
    _idManager = new IdManager();

    static from(obj) {
        const dataTree = new DataTree();
        const tempNodes = {};

        // IDManager 복원
        Object.assign(dataTree._idManager, obj._idManager);

        // 노드 복원
        for (const id in obj._nodes) {
            const nodeObj = obj._nodes[id];
            tempNodes[id] = convert(nodeObj);
        }
        dataTree._nodes = tempNodes;

        function convert(obj) {
            const type = obj._type;
            let node;
            if (type === 'Item') {
                node = Object.assign(new Item(), obj);
            } else if (type === 'Material') {
                node = Object.assign(new Material(), obj);
            } else {
                throw new Error(`Invalid type: ${type}`);
            }

            if (node._child) {
                for (const key in node._child) {
                    const entry = node._child[key];
                    entry.node = convert(entry.node);
                }
            }

            return node;
        }

        return dataTree;
    }

    toObject() {
        const simpleNodes = {};

        for (const id in this._nodes) {
            const node = this._nodes[id];
            simpleNodes[id] = simplify(node);
        }

        return {
            _idManager: {
                usedIds: Array.from(this._idManager.usedIds),
                lastGenerated: this._idManager.lastGenerated
            },
            _nodes: simpleNodes
        };

        function simplify(node) {
            const base = {...node};

            if (node._child) {
                base._child = {};
                for (const key in node._child) {
                    const entry = node._child[key];
                    base._child[key] = {
                        node: simplify(entry.node),
                        quantity: entry.quantity
                    };
                }
            }

            return base;
        }
    }

    get nodes() {
        return this._nodes;
    }

    getNodeById(id) {
        return this._nodes[id];
    }

    createItem(name, salesPrice) {
        const id = this._idManager.create();
        const item = new Item(id, name, salesPrice);
        this._nodes[id] = item;
        return item;
    }

    createMaterial(name, quantity, cost) {
        const id = this._idManager.create();
        const material = new Material(id, name, quantity, cost);
        this._nodes[id] = material;
        return material;
    }

    removeNode(id) {
        delete this._nodes[id];
        for (const node of Object.values(this._nodes)) {
            if (node.child && node.child[id]) {
                delete node.child[id];
                if (Object.keys(node.child).length === 0) node._child = null;
            }
        }
    }

    insertChild(parentId, childId, quantity) {
        const parentNode = this.getNodeById(parentId);
        const childNode = this.getNodeById(childId);
        parentNode.insert(childNode, quantity);
    }

    removeChild(parentId, childId) {
        const parentNode = this.getNodeById(parentId);
        const childNode = this.getNodeById(childId);
        parentNode.remove(childNode);
    }
}

class TreeNode {
    constructor(id, name) {
        this._id = id;
        this._name = name;
        this._cost = null;
        this._quantity = null;
        this._child = null;
    }

    insert(node, quantity) {
        if (node instanceof Item) {
            throw new Error(`'${node._name}' 항목은 제품이기에 하위 항목 설정이 불가`);
        }

        if (!this._child) {
            this._child = {};
            this._cost = null;
        }

        this._child[node.id] = {node, quantity};

        if (this.hasCycle()) {
            delete this._child[node.id];
            if (Object.keys(this._child).length === 0) {
                this._child = null;
            }
            throw new Error(`'${this._name}' → '${node._name}' 연결 시 순환 참조 발생`);
        }
    }

    remove(node) {
        delete this._child[node.id];
        if (Object.keys(this._child).length === 0) {
            this._child = null;
        }
    }

    hasCycle(seen = new Set()) {
        if (seen.has(this._id)) return true;
        seen.add(this._id);
        if (this._child) {
            for (const key in this._child) {
                const childNode = this._child[key].node;
                if (childNode.hasCycle(new Set(seen))) return true;
            }
        }
        return false;
    }

    get id() {
        return this._id;
    }

    get name() {
        return this._name;
    }

    set name(val) {
        this._name = val;
    }

    get cost() {
        return this._cost;
    }

    set cost(val) {
        if (this._child) {
            throw new Error(`'${this._name}' 안에 하위 항목들이 존재하므로, 가격 임의 변경이 불가능 합니다.`);
        }
        this._cost = val;
    }

    get quantity() {
        return this._quantity;
    }

    set quantity(val) {
        this._quantity = val;
    }

    get child() {
        return this._child;
    }

    get unitCost() {
        if (!this._child) {
            if (this._cost == null || this._quantity === 0) return 0;
            return this._cost / this._quantity;
        }
        let unitCost = 0;
        for (const key in this._child) {
            const obj = this._child[key];
            unitCost += obj.node.unitCost * obj.quantity;
        }
        return unitCost;
    }
}

class Item extends TreeNode {
    constructor(id, name, salesPrice) {
        super(id, name);
        this._salesPrice = salesPrice;
        this._quantity = 1;
        this._type = 'Item';
    }

    get type() {
        return this._type;
    }

    get salesPrice() {
        return this._salesPrice;
    }

    set salesPrice(val) {
        this._salesPrice = val;
    }

    set quantity(_) {
        throw new Error(`Item 으로 등록된 '${this._name}' 의 수량 변경은 불가능 합니다.`);
    }
}

class Material extends TreeNode {
    constructor(id, name, quantity, cost) {
        super(id, name);
        this._quantity = quantity;
        this._cost = cost;
        this._type = 'Material';
    }

    get type() {
        return this._type
    }
}