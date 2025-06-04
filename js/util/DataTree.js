/**
 전체 데이터를 담는 자료구조
 */
class DataTree {
    _nodes = {};

    static from(obj) {
        const dataTree = Object.assign(new DataTree(), obj);
        const tempNodes = {};
        for (const key in dataTree.nodes) {
            const nodeObj = dataTree.nodes[key];
            convert(nodeObj);
        }

        dataTree.nodes = tempNodes;

        function convert(obj) {
            if (tempNodes[obj.name]) {
                return tempNodes[obj.name];
            }

            const type = obj._type;

            let node;
            if (type === 'Item') {
                node = Object.assign(new Item(), obj);
            } else if (type === 'Material') {
                node = Object.assign(new Material(), obj);
            } else {
                throw new Error(`Invalid type : ${type} | ${JSON.stringify(obj)}`);
            }
            tempNodes[node.name] = node;

            for (const key in node.child) {
                node.child[key].node = convert(node.child[key].node);
            }

            return node;
        }

        return dataTree;
    }


    get nodes() {
        return this._nodes;
    }

    set nodes(nodes) {
        this._nodes = nodes;
    }

    createItem(name, salesPrice) {
        const item = new Item(name, salesPrice);
        this._nodes[name] = item;
        return item;
    }

    createMaterial(name, quantity, cost) {
        const material = new Material(name, quantity, cost);
        this._nodes[name] = material;
        return material;
    }

    getNode(name) {
        const node = this._nodes[name];
        if (!node) {
            throw new Error(`'${name}' 미등록 제품`);
        }
        return node;
    }

    removeNode(name) {
        delete this._nodes[name];
        for (const key in this._nodes) {
            const node = this._nodes[key];
            if (node.child && node.child[name]) {
                delete node.child[name];
                if (Object.keys(node.child).length === 0) node._child = null;
            }
        }
    }

    insertChild(parentName, childName, quantity) {
        const parentNode = this.getNode(parentName);
        const childNode = this.getNode(childName);
        parentNode.insert(childNode, quantity);
    }

    removeChild(parentName, childName) {
        const parentNode = this.getNode(parentName);
        const childNode = this.getNode(childName);
        parentNode.remove(childNode);
    }
}

class Node {
    _name; // 제품명
    _cost; // 원가
    _quantity; // 수량(용량)
    _child; // 제품을 구성하는 재료들 List.
    _type;

    constructor(name) {
        this._name = name;
        this._cost = null;
        this._child = null;
    }

    /**
     * 이 node 를 구성하는 재료 추가
     * @param {Node} node - 추가할 재료
     * @param {number} quantity - 사용 수량
     */
    insert(node, quantity) {
        if (node instanceof Item) {
            throw new Error(`'${node._name}' 항목은 제품이기에 하위 항목 설정이 불가`);
        }

        if (!this._child) {
            this._child = {};
            this._cost = null;
        }

        this._child[node.name] = { node, quantity };

        // 순환 참조 검사
        if (this.hasCycle()) {
            // 되돌리기
            delete this._child[node.name];
            if (Object.keys(this._child).length === 0) {
                this._child = null;
            }
            throw new Error(`'${this._name}' → '${node._name}' 연결 시 순환 참조 발생`);
        }
    }

    remove(node) {
        delete this._child[node.name];
        if (Object.keys(this._child).length === 0) {
            this._child = null;
        }
    }

    get name() {
        return this._name;
    }

    get cost() {
        return this._cost;
    }

    get unitCost() {
        if (!this._child) {
            if (this._cost == null || this._quantity === 0) return 0;
            return this._cost / this._quantity;
        }
        // TODO 값을 가져올떄마다 전체 스캔을 하므로, 차후 필요시 성능 개선할 것.
        let unitCost = 0;
        for (const name in this._child) {
            const obj = this._child[name]; // {node:node, quantity:quantity}
            unitCost += obj.node.unitCost * obj.quantity;
        }
        return unitCost;
    }

    get child() {
        return this._child;
    }

    get type() {
        return this._type;
    }

    set cost(cost) {
        if (this._child) {
            throw new Error(`'${this._name}' 안에 하위 항목들이 존재하므로, 가격 임의 변경이 불가능 합니다.`);
        }
        this._cost = cost;
    }

    set name(name) {
        this._name = name;
    }

    get quantity() {
        return this._quantity;
    }

    set quantity(quantity) {
        if (this._type === 'Item') {
            throw new Error(`Item '${this._name}'의 수량 변경은 불가능`);
        }
        this._quantity = quantity;
    }

    /**
     * 순환 참조 여부 체크
     * @param {Set<string>} seen - 중복 방문 체크용
     * @returns {boolean} - 순환 참조 여부
     */
    hasCycle(seen = new Set()) {
        if (seen.has(this._name)) return true;
        seen.add(this._name);

        if (this._child) {
            for (const key in this._child) {
                const childNode = this._child[key].node;
                if (childNode.hasCycle(new Set(seen))) return true;
            }
        }

        return false;
    }
}

class Item extends Node {
    _salesPrice; // 판매가

    constructor(name, salesPrice) {
        super(name);
        this._salesPrice = salesPrice;
        this._quantity = 1;
        this._type = 'Item';
    }

    get salesPrice() {
        return this._salesPrice;
    }

    set salesPrice(salesPrice) {
        this._salesPrice = salesPrice;
    }

    set quantity(_cantChange) {
        throw new Error(`Item 으로 등록된 '${this._name}' 의 수량 변경은 불가능 합니다.`);
    }
}

class Material extends Node {
    constructor(name, quantity, cost) {
        super(name);
        this._cost = cost;
        this._quantity = quantity;
        this._type = 'Material';
    }
}