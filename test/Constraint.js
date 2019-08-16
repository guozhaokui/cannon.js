import Constraint from '../src/constraints/Constraint';
import Equation from '../src/equations/Equation';
import Body from '../src/objects/Body';

export default {
    construct(test) {
        const bodyA = new Body();
        const bodyB = new Body();
        new Constraint(bodyA, bodyB);
        test.done();
    },

    enable(test) {
        const bodyA = new Body();
        const bodyB = new Body();
        const c = new Constraint(bodyA, bodyB);
        const eq = new Equation(bodyA, bodyB);
        c.equations.push(eq);

        c.enable();
        test.ok(eq.enabled);

        c.disable();
        test.ok(!eq.enabled);

        test.done();
    }
};

