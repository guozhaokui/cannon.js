/**
 * Base class for shapes
 */
export default class Shape {
    constructor(options) {
        this.id = Shape.idCounter++;
        this.type = 0;
        /**
         * The local bounding sphere radius of this shape.
         */
        this.boundingSphereRadius = 0;
        /**
         * Whether to produce contact forces when in contact with other bodies. Note that contacts will be generated, but they will be disabled.
         */
        this.collisionResponse = true;
        this.collisionFilterGroup = 1;
        this.collisionFilterMask = -1;
        this.material = null;
        this.body = null;
        if (options) {
            this.type = options.type || 0;
            this.collisionResponse = options.collisionResponse ? options.collisionResponse : true;
            this.collisionFilterGroup = options.collisionFilterGroup !== undefined ? options.collisionFilterGroup : 1;
            this.collisionFilterMask = options.collisionFilterMask !== undefined ? options.collisionFilterMask : -1;
            this.material = options.material ? options.material : null;
        }
    }
    /**
     * Computes the bounding sphere radius. The result is stored in the property .boundingSphereRadius
     */
    updateBoundingSphereRadius() {
        throw `computeBoundingSphereRadius() not implemented for shape type ${this.type}`;
    }
    calculateWorldAABB(pos, quat, min, max) {
    }
    /**
     * Get the volume of this shape
     */
    volume() {
        throw `volume() not implemented for shape type ${this.type}`;
    }
    /**
     * Calculates the inertia in the local frame for this shape.
     * @see http://en.wikipedia.org/wiki/List_of_moments_of_inertia
     */
    calculateLocalInertia(mass, target) {
        throw `calculateLocalInertia() not implemented for shape type ${this.type}`;
    }
}
Shape.idCounter = 0;
/**
 * The available shape types.
 */
Shape.types = {
    SPHERE: 1,
    PLANE: 2,
    BOX: 4,
    COMPOUND: 8,
    CONVEXPOLYHEDRON: 16,
    HEIGHTFIELD: 32,
    PARTICLE: 64,
    CYLINDER: 128,
    TRIMESH: 256
};
