import Constraint from './Constraint.js';
import ContactEquation from '../equations/ContactEquation.js';
/**
 * Constrains two bodies to be at a constant distance from each others center of mass.
 * @author schteppe
 * @param  [distance] The distance to keep. If undefined, it will be set to the current distance between bodyA and bodyB
 * @param  [maxForce=1e6]
 * 用distance中点方作为碰撞点来实现
 */
export default class DistanceConstraint extends Constraint {
    constructor(bodyA, bodyB, distance, maxForce) {
        super(bodyA, bodyB, true);
        this.distance = 0;
        if (typeof (distance) === "undefined") {
            distance = bodyA.position.distanceTo(bodyB.position);
        }
        if (typeof (maxForce) === "undefined") {
            maxForce = 1e6;
        }
        this.distance = distance;
        const eq = this.distanceEquation = new ContactEquation(bodyA, bodyB);
        this.equations.push(eq);
        // Make it bidirectional
        eq.minForce = -maxForce;
        eq.maxForce = maxForce;
    }
    update() {
        const bodyA = this.bodyA;
        const bodyB = this.bodyB;
        const eq = this.distanceEquation;
        const halfDist = this.distance * 0.5;
        const normal = eq.ni;
        bodyB.position.vsub(bodyA.position, normal); // normal = B-A
        normal.normalize();
        normal.scale(halfDist, eq.ri);
        normal.scale(-halfDist, eq.rj);
    }
}
