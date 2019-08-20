/**
 * Constraint equation solver base class.
 * @author schteppe / https://github.com/schteppe
 */
export default class Solver {
    constructor() {
        //All equations to be solved
        this.equations = [];
    }
    /**
     * Should be implemented in subclasses!
     */
    solve(dt, world) {
        // Should return the number of iterations done!
        return 0;
    }
    addEquation(eq) {
        if (eq.enabled) {
            this.equations.push(eq);
        }
    }
    removeEquation(eq) {
        const eqs = this.equations;
        const i = eqs.indexOf(eq);
        if (i !== -1) {
            eqs.splice(i, 1);
        }
    }
    /**
     * remove all equations
     */
    removeAllEquations() {
        this.equations.length = 0;
    }
}
