import Vec3 from '../math/Vec3';
import Pool from './Pool';

export default class Vec3Pool extends Pool {
    constructor() {
        super();
        this.type=Vec3;
    }

    constructObject() {
        return new Vec3();
    }
}
