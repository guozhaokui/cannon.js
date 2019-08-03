import Equation from './Equation.js';
import Vec3 from '../math/Vec3.js';
import Body from '../objects/Body.js';

/**
 * Contact/non-penetration constraint equation
 * @author schteppe
 * TODO 复用
 */
export default class ContactEquation extends Equation {
    // 补偿值。保持一定距离，
    restitution = 0.0; // "bounciness": u1 = -e*u0

    /**
     * World-oriented vector that goes from the center of bi to the contact point.
     * 从bi中心指向碰撞点的向量。世界空间。
     */
    ri = new Vec3();

    /**
     * World-oriented vector that starts in body j position and goes to the contact point.
     * 从bj中心指向碰撞点的向量。世界空间。
     */
    rj = new Vec3();

    /**
     * Contact normal, pointing out of body i.
     * 指向第一个对象的外面的碰撞法线
     */
    ni = new Vec3();

    constructor(bodyA: Body, bodyB: Body, maxForce = 1e6) {
        super(bodyA, bodyB, 0, maxForce);

    }

    computeB(h:number) {
        const a = this.a;
        const b = this.b;
        const bi = this.bi;
        const bj = this.bj;
        const ri = this.ri;
        const rj = this.rj;
        const rixn = ContactEquation_computeB_temp1;
        const rjxn = ContactEquation_computeB_temp2;
        const vi = bi.velocity;
        const wi = bi.angularVelocity;
        const fi = bi.force;
        const taui = bi.torque;
        const vj = bj.velocity;
        const wj = bj.angularVelocity;
        const fj = bj.force;
        const tauj = bj.torque;
        const penetrationVec = ContactEquation_computeB_temp3;
        const GA = this.jacobianElementA;
        const GB = this.jacobianElementB;
        const n = this.ni;

        // Caluclate cross products
        ri.cross(n, rixn);
        rj.cross(n, rjxn);

        // g = xj+rj -(xi+ri)
        // G = [ -ni  -rixn  ni  rjxn ]
        n.negate(GA.spatial);
        rixn.negate(GA.rotational);
        GB.spatial.copy(n);
        GB.rotational.copy(rjxn);

        // Calculate the penetration vector
        penetrationVec.copy(bj.position);
        penetrationVec.vadd(rj, penetrationVec);
        penetrationVec.vsub(bi.position, penetrationVec);
        penetrationVec.vsub(ri, penetrationVec);

        const g = n.dot(penetrationVec);

        // Compute iteration
        const ePlusOne = this.restitution + 1;
        const GW = ePlusOne * vj.dot(n) - ePlusOne * vi.dot(n) + wj.dot(rjxn) - wi.dot(rixn);
        const GiMf = this.computeGiMf();

        const B = - g * a - GW * b - h * GiMf;

        return B;
    }

    /**
     * Get the current relative velocity in the contact point.
     * 计算相撞在法线方向的速度的力量 dot(relv, normal) ,相对于i
     */
    getImpactVelocityAlongNormal() {
        const vi = ContactEquation_getImpactVelocityAlongNormal_vi;
        const vj = ContactEquation_getImpactVelocityAlongNormal_vj;
        const xi = ContactEquation_getImpactVelocityAlongNormal_xi;
        const xj = ContactEquation_getImpactVelocityAlongNormal_xj;
        const relVel = ContactEquation_getImpactVelocityAlongNormal_relVel;

        this.bi.position.vadd(this.ri, xi); // xi = bi.pos + this.ri
        this.bj.position.vadd(this.rj, xj); // xj = bj.pos + this.rj

        // xi和xj难道不在一个点上么
        this.bi.getVelocityAtWorldPoint(xi, vi);
        this.bj.getVelocityAtWorldPoint(xj, vj);

        vi.vsub(vj, relVel);    // relVel = vi-vj

        return this.ni.dot(relVel);
    }
}

var ContactEquation_computeB_temp1 = new Vec3(); // Temp vectors
var ContactEquation_computeB_temp2 = new Vec3();
var ContactEquation_computeB_temp3 = new Vec3();

var ContactEquation_getImpactVelocityAlongNormal_vi = new Vec3();
var ContactEquation_getImpactVelocityAlongNormal_vj = new Vec3();
var ContactEquation_getImpactVelocityAlongNormal_xi = new Vec3();
var ContactEquation_getImpactVelocityAlongNormal_xj = new Vec3();
var ContactEquation_getImpactVelocityAlongNormal_relVel = new Vec3();

