export class MessageCatalog {

    constructor(chunkId) {
        this.chunkId = chunkId;
    }

    toObject(data) {
        Object.assign(this, data);
        return this;
    }

    toString() {
        return `chunkId: ${this.chunkId}`;
    }
}
