import World from "../world/World";

/**
 * Constraint equation solver base class.
 * @author schteppe / https://github.com/schteppe
 */
export default class Solver {
    //All equations to be solved
    equations = [];
    constructor() {
    }

    /**
     * Should be implemented in subclasses!
     */
    solve(dt:number, world:World) {
        // Should return the number of iterations done!
        return 0;
    }

    /**
     * Add an equation
     * @method addEquation
     * @param {Equation} eq
     */
    addEquation(eq) {
        if (eq.enabled) {
            this.equations.push(eq);
        }
    }

    /**
     * Remove an equation
     * @method removeEquation
     * @param {Equation} eq
     */
    removeEquation(eq) {
        const eqs = this.equations;
        const i = eqs.indexOf(eq);
        if (i !== -1) {
            eqs.splice(i, 1);
        }
    }

    /**
     * Add all equations
     */
    removeAllEquations() {
        this.equations.length = 0;
    }
}

