import Material from './Material.js';
/**
 * Defines what happens when two materials meet.
 * @class ContactMaterial
 * @constructor
 * @param {Material} m1
 * @param {Material} m2
 * @param {object} [options]
 * @param {Number} [options.friction=0.3]
 * @param {Number} [options.restitution=0.3]
 * @param {number} [options.contactEquationStiffness=1e7]
 * @param {number} [options.contactEquationRelaxation=3]
 * @param {number} [options.frictionEquationStiffness=1e7]
 * @param {Number} [options.frictionEquationRelaxation=3]
 */
export default class ContactMaterial extends Material {
    constructor(m1, m2, friction, restitution) {
        super('contactMaterial', friction, restitution);
        /**
         * Identifier of this material
         */
        this.id = ContactMaterial.idCounter++;
        /**
         * Friction coefficient
         */
        this.friction = 0.3;
        /**
         * Restitution coefficient
         */
        this.restitution = 0.3;
        /**
         The stiffness approximately corresponds to the stiffness of a spring, which gives a force F=-k*x where x is the displacement of the spring.
         Regularization time is corresponds to the number of time steps you need to take to stabilize the constraint (larger value => softer contact).
        */
        /**
         * Stiffness of the produced contact equations
         */
        this.contactEquationStiffness = 1e7; // SPOOK: ε = .. k
        /**
         * Relaxation time of the produced contact equations
         */
        this.contactEquationRelaxation = 3; // SPOOK : d
        /**
         * Stiffness of the produced friction equations
         */
        this.frictionEquationStiffness = 1e7;
        /**
         * Relaxation time of the produced friction equations
         */
        this.frictionEquationRelaxation = 3;
        this.materials = [m1, m2];
    }
}
ContactMaterial.idCounter = 0;
