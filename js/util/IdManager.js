import UrlDataManager from "./UrlDataManger";

class IdManager {
    set = new Set();

    lastId = 1;

    add(id) {
        if (typeof id !== 'number') {
            throw new Error(`The ID must be numeric only.`)
        }
        if (this.hasId(id)) {
            return false;
        }
        this.set.add(id);
        return true;
    }

    hasId(id) {
        return this.set.has(id);
    }

    createId() {
        let id = this.lastId;

        while (true) {
            if (!this.hasId(id)) {
                this.add(id);
                this.lastId = id;
                return id;
            }
            id++;

        }
    }
}