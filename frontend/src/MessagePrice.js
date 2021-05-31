export class MessagePrice {

    constructor(productId, message) {
        this.productId = productId;
        this.message = message;
    }

    toObject(data) {
        Object.assign(this, data);
        return this;
    }

    toString() {
        return `chunkId: ${this.productId}`;
    }
}
