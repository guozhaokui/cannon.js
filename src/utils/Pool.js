/**
 * For pooling objects that can be reused.
 * @class Pool
 * @constructor
 */
export default class Pool {
    constructor() {
        /**
         * The pooled objects
         */
        this.objects = [];
    }
    /**
     * Release an object after use
     * @method release
     * @param {Object} obj
     */
    release(...args) {
        const Nargs = args.length;
        for (let i = 0; i !== Nargs; i++) {
            this.objects.push(args[i]);
        }
        return this;
    }
    /**
     * Get an object
     * @method get
     */
    get() {
        if (this.objects.length === 0) {
            return this.constructObject();
        }
        else {
            return this.objects.pop();
        }
    }
    /**
     * Construct an object. Should be implmented in each subclass.
     */
    constructObject() {
        throw new Error("constructObject() not implemented in this Pool subclass yet!");
    }
    /**
     * @method resize
     * @param  size
     * @return  Self, for chaining
     */
    resize(size) {
        const objects = this.objects;
        while (objects.length > size) {
            objects.pop();
        }
        while (objects.length < size) {
            objects.push(this.constructObject());
        }
        return this;
    }
}
