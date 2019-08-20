import Vec3 from '../math/Vec3.js';
import Equation from './Equation.js';
/**
 * Cone equation. Works to keep the given body world vectors aligned, or tilted within a given angle from each other.
 */
export default class ConeEquation extends Equation {
    constructor(bodyA, bodyB, maxForce = 1e6, axisA = new Vec3(1, 0, 0), axisB = new Vec3(0, 1, 0), angle = 0) {
        super(bodyA, bodyB, -maxForce, maxForce);
        this.angle = 0; //The cone angle to keep
        this.axisA = axisA.clone();
        this.axisB = axisB.clone();
        this.angle = angle;
    }
    computeB(h) {
        const a = this.a;
        const b = this.b;
        const ni = this.axisA;
        const nj = this.axisB;
        const nixnj = tmpVec1;
        const njxni = tmpVec2;
        const GA = this.jacobianElementA;
        const GB = this.jacobianElementB;
        // Caluclate cross products
        ni.cross(nj, nixnj);
        nj.cross(ni, njxni);
        // The angle between two vector is:
        // cos(theta) = a * b / (length(a) * length(b) = { len(a) = len(b) = 1 } = a * b
        // g = a * b
        // gdot = (b x a) * wi + (a x b) * wj
        // G = [0 bxa 0 axb]
        // W = [vi wi vj wj]
        GA.rotational.copy(njxni);
        GB.rotational.copy(nixnj);
        const g = Math.cos(this.angle) - ni.dot(nj);
        const GW = this.computeGW();
        const GiMf = this.computeGiMf();
        const B = -g * a - GW * b - h * GiMf;
        return B;
    }
}
var tmpVec1 = new Vec3();
var tmpVec2 = new Vec3();
