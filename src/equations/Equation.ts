import JacobianElement from '../math/JacobianElement.js';
import Vec3 from '../math/Vec3.js';
import Body from '../objects/Body.js';

/**
 * Equation base class
 * @author schteppe
 * @param  minForce Minimum (read: negative max) force to be applied by the constraint.
 * @param  maxForce Maximum (read: positive max) force to be applied by the constraint.
 */
export default class Equation {
    static ID = 0;
    id = Equation.ID++;

    minForce = -1e6;
    maxForce = 1e6;
    bi: Body = null;
    bj: Body = null;

    //SPOOK parameter
    a = 0;
    b = 0;
    eps = 0;

    jacobianElementA = new JacobianElement();
    jacobianElementB = new JacobianElement();
    enabled = true;
    /**
     * A number, proportional to the force added to the bodies.
     */
    multiplier = 0;

    constructor(bi: Body, bj: Body, minForce?: number, maxForce?: number) {
        this.minForce = typeof (minForce) === "undefined" ? -1e6 : minForce;
        this.maxForce = typeof (maxForce) === "undefined" ? 1e6 : maxForce;
        this.bi = bi;
        this.bj = bj;
        // Set typical spook params
        this.setSpookParams(1e7, 4, 1 / 60);
    }

    /**
     * Recalculates a,b,eps.
     */
    setSpookParams(stiffness: number, relaxation: number, timeStep: number) {
        const d = relaxation;
        const k = stiffness;
        const h = timeStep;
        this.a = 4.0 / (h * (1 + 4 * d));
        this.b = (4.0 * d) / (1 + 4 * d);
        this.eps = 4.0 / (h * h * k * (1 + 4 * d));
    }

    /**
     * Computes the RHS of the SPOOK equation
     * SPOOK式子的右半部分
     *  Sλ = B = -aGq - bGW -hGiMf
     */
    computeB(a: number, b: number, h: number) {
        const GW = this.computeGW();
        const Gq = this.computeGq();
        const GiMf = this.computeGiMf();
        return - Gq * a - GW * b - GiMf * h;
    }

    /**
     * Computes G*q, where q are the generalized body coordinates
     */
    computeGq() {
        const GA = this.jacobianElementA;
        const GB = this.jacobianElementB;
        const bi = this.bi;
        const bj = this.bj;
        const xi = bi.position;
        const xj = bj.position;
        return GA.spatial.dot(xi) + GB.spatial.dot(xj);
    }

    /**
     * Computes G*W, where W are the body velocities
     */
    computeGW() {
        const GA = this.jacobianElementA;
        const GB = this.jacobianElementB;
        const bi = this.bi;
        const bj = this.bj;
        const vi = bi.velocity;
        const vj = bj.velocity;
        const wi = bi.angularVelocity;
        const wj = bj.angularVelocity;
        return GA.multiplyVectors(vi, wi) + GB.multiplyVectors(vj, wj);
    }

    /**
     * Computes G*Wlambda, where W are the body velocities
     */
    computeGWlambda() {
        const GA = this.jacobianElementA;
        const GB = this.jacobianElementB;
        const bi = this.bi;
        const bj = this.bj;
        const vi = bi.vlambda;
        const vj = bj.vlambda;
        const wi = bi.wlambda;
        const wj = bj.wlambda;
        return GA.multiplyVectors(vi, wi) + GB.multiplyVectors(vj, wj);
    }

    /**
     * Computes G*inv(M)*f, where M is the mass matrix with diagonal blocks for each body, and f are the forces on the bodies.
     */
    computeGiMf() {
        const GA = this.jacobianElementA;
        const GB = this.jacobianElementB;
        const bi = this.bi;
        const bj = this.bj;
        const fi = bi.force;
        const ti = bi.torque;
        const fj = bj.force;
        const tj = bj.torque;
        const invMassi = bi.invMassSolve;
        const invMassj = bj.invMassSolve;

        fi.scale(invMassi, iMfi);
        fj.scale(invMassj, iMfj);

        bi.invInertiaWorldSolve.vmult(ti, invIi_vmult_taui);
        bj.invInertiaWorldSolve.vmult(tj, invIj_vmult_tauj);

        return GA.multiplyVectors(iMfi, invIi_vmult_taui) + GB.multiplyVectors(iMfj, invIj_vmult_tauj);
    }

    /**
     * Computes G*inv(M)*G'
     */
    computeGiMGt() {
        const GA = this.jacobianElementA;
        const GB = this.jacobianElementB;
        const bi = this.bi;
        const bj = this.bj;
        const invMassi = bi.invMassSolve;
        const invMassj = bj.invMassSolve;
        const invIi = bi.invInertiaWorldSolve;
        const invIj = bj.invInertiaWorldSolve;
        let result = invMassi + invMassj;

        invIi.vmult(GA.rotational, tmp);
        result += tmp.dot(GA.rotational);

        invIj.vmult(GB.rotational, tmp);
        result += tmp.dot(GB.rotational);

        return result;
    }

    /**
     * Add constraint velocity to the bodies.
     */
    addToWlambda(deltalambda: number) {
        const GA = this.jacobianElementA;
        const GB = this.jacobianElementB;
        const bi = this.bi;
        const bj = this.bj;
        const temp = addToWlambda_temp;

        // Add to linear velocity
        // v_lambda += inv(M) * delta_lamba * G
        bi.vlambda.addScaledVector(bi.invMassSolve * deltalambda, GA.spatial, bi.vlambda);
        bj.vlambda.addScaledVector(bj.invMassSolve * deltalambda, GB.spatial, bj.vlambda);

        // Add to angular velocity
        bi.invInertiaWorldSolve.vmult(GA.rotational, temp);
        bi.wlambda.addScaledVector(deltalambda, temp, bi.wlambda);

        bj.invInertiaWorldSolve.vmult(GB.rotational, temp);
        bj.wlambda.addScaledVector(deltalambda, temp, bj.wlambda);
    }

    /**
     * Compute the denominator part of the SPOOK equation: C = G*inv(M)*G' + eps
     */
    computeC() {
        return this.computeGiMGt() + this.eps;
    }
}

const zero = new Vec3();
var iMfi = new Vec3();
var iMfj = new Vec3();
var invIi_vmult_taui = new Vec3();
var invIj_vmult_tauj = new Vec3();
var tmp = new Vec3();
var addToWlambda_temp = new Vec3();
const addToWlambda_Gi = new Vec3();
const addToWlambda_Gj = new Vec3();
const addToWlambda_ri = new Vec3();
const addToWlambda_rj = new Vec3();
const addToWlambda_Mdiag = new Vec3();
