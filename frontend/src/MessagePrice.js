export class MessagePrice {

    constructor(productId) {
        this.productId = productId;
    }

    toObject(data) {
        Object.assign(this, data);
        return this;
    }

    toString() {
        return `chunkId: ${this.productId}`;
    }
}
