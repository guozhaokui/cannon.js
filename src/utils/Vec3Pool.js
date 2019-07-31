import Vec3 from '../math/Vec3.js';
import Pool from './Pool.js';

/**
 * @class Vec3Pool
 * @constructor
 * @extends Pool
 */
export default class Vec3Pool extends Pool {
 constructor() {
     super();
     this.type = Vec3;
 }

 /**
  * Construct a vector
  * @method constructObject
  * @return {Vec3}
  */
 constructObject() {
     return new Vec3();
 }
}
