/**
 * Constraint base class
 * @author schteppe
 */
export default class Constraint {
    constructor(bodyA, bodyB, wakeupBodies) {
        /**
         * Equations to be solved in this constraint
         */
        this.equations = [];
        this.bodyA = null;
        this.bodyB = null;
        this.id = Constraint.idCounter++;
        /**
         * Set to true if you want the bodies to collide when they are connected.
         */
        this.collideConnected = true;
        this.bodyA = bodyA;
        this.bodyB = bodyB;
        if (wakeupBodies) {
            if (bodyA) {
                bodyA.wakeUp();
            }
            if (bodyB) {
                bodyB.wakeUp();
            }
        }
    }
    /**
     * Update all the equations with data.
     */
    update() {
        throw new Error("method update() not implmemented in this Constraint subclass!");
    }
    /**
     * Enables all equations in the constraint.
     */
    enable() {
        const eqs = this.equations;
        for (let i = 0; i < eqs.length; i++) {
            eqs[i].enabled = true;
        }
    }
    /**
     * Disables all equations in the constraint.
     */
    disable() {
        const eqs = this.equations;
        for (let i = 0; i < eqs.length; i++) {
            eqs[i].enabled = false;
        }
    }
}
Constraint.idCounter = 0;
