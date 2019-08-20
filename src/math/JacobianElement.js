import Vec3 from './Vec3.js';
/**
 * An element containing 6 entries, 3 spatial and 3 rotational degrees of freedom.
 */
export default class JacobianElement {
    constructor() {
        this.spatial = new Vec3();
        this.rotational = new Vec3();
    }
    /**
     * Multiply with other JacobianElement
     */
    multiplyElement(element) {
        return element.spatial.dot(this.spatial) + element.rotational.dot(this.rotational);
    }
    /**
     * Multiply with two vectors
     */
    multiplyVectors(spatial, rotational) {
        return spatial.dot(this.spatial) + rotational.dot(this.rotational);
    }
}
