

import Vec3 from '../math/Vec3.js';

/**
 * Base class for shapes
 * @class Shape
 * @constructor
 * @param {object} [options]
 * @param {number} [options.collisionFilterGroup=1]
 * @param {number} [options.collisionFilterMask=-1]
 * @param {number} [options.collisionResponse=true]
 * @param {number} [options.material=null]
 * @author schteppe
 */
export default  class Shape {
    constructor(options = {}) {
     /**
      * Identifyer of the Shape.
      * @property {number} id
      */
     this.id = Shape.idCounter++;

     /**
      * The type of this shape. Must be set to an int > 0 by subclasses.
      * @property type
      * @type {Number}
      * @see Shape.types
      */
     this.type = options.type || 0;

     /**
      * The local bounding sphere radius of this shape.
      * @property {Number} boundingSphereRadius
      */
     this.boundingSphereRadius = 0;

     /**
      * Whether to produce contact forces when in contact with other bodies. Note that contacts will be generated, but they will be disabled.
      * @property {boolean} collisionResponse
      */
     this.collisionResponse = options.collisionResponse ? options.collisionResponse : true;

     /**
      * @property {Number} collisionFilterGroup
      */
     this.collisionFilterGroup = options.collisionFilterGroup !== undefined ? options.collisionFilterGroup : 1;

     /**
      * @property {Number} collisionFilterMask
      */
     this.collisionFilterMask = options.collisionFilterMask !== undefined ? options.collisionFilterMask : -1;

     /**
      * @property {Material} material
      */
     this.material = options.material ? options.material : null;

     /**
      * @property {Body} body
      */
     this.body = null;
    }

    /**
     * Computes the bounding sphere radius. The result is stored in the property .boundingSphereRadius
     * @method updateBoundingSphereRadius
     */
    updateBoundingSphereRadius() {
        throw `computeBoundingSphereRadius() not implemented for shape type ${this.type}`;
    };

    /**
     * Get the volume of this shape
     * @method volume
     * @return {Number}
     */
    volume() {
        throw `volume() not implemented for shape type ${this.type}`;
    };

    /**
     * Calculates the inertia in the local frame for this shape.
     * @method calculateLocalInertia
     * @param {Number} mass
     * @param {Vec3} target
     * @see http://en.wikipedia.org/wiki/List_of_moments_of_inertia
     */
    calculateLocalInertia(mass, target) {
        throw `calculateLocalInertia() not implemented for shape type ${this.type}`;
    };

}

Shape.idCounter = 0;

/**
 * The available shape types.
 * @static
 * @property types
 * @type {Object}
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

