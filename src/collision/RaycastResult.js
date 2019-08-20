import Vec3 from '../math/Vec3.js';
/**
 * Storage for Ray casting data.
 */
export default class RaycastResult {
    constructor() {
        this.rayFromWorld = new Vec3();
        this.rayToWorld = new Vec3();
        this.hitNormalWorld = new Vec3();
        this.hitPointWorld = new Vec3();
        this.hasHit = false;
        this.shape = null;
        /**
         * The hit body, or null.
         */
        this.body = null;
        /**
         * The index of the hit triangle, if the hit shape was a trimesh.
         */
        this.hitFaceIndex = -1;
        /**
         * Distance to the hit. Will be set to -1 if there was no hit.
         */
        this.distance = -1;
        /**
         * If the ray should stop traversing the bodies.
         */
        this._shouldStop = false;
    }
    /**
     * Reset all result data.
     * @method reset
     */
    reset() {
        this.rayFromWorld.setZero();
        this.rayToWorld.setZero();
        this.hitNormalWorld.setZero();
        this.hitPointWorld.setZero();
        this.hasHit = false;
        this.shape = null;
        this.body = null;
        this.hitFaceIndex = -1;
        this.distance = -1;
        this._shouldStop = false;
    }
    /**
     * @method abort
     */
    abort() {
        this._shouldStop = true;
    }
    set(rayFromWorld, rayToWorld, hitNormalWorld, hitPointWorld, shape, body, distance) {
        this.rayFromWorld.copy(rayFromWorld);
        this.rayToWorld.copy(rayToWorld);
        this.hitNormalWorld.copy(hitNormalWorld);
        this.hitPointWorld.copy(hitPointWorld);
        this.shape = shape;
        this.body = body;
        this.distance = distance;
    }
}
