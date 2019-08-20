import Vec3 from '../math/Vec3.js';
import Transform from '../math/Transform.js';
import RaycastResult from '../collision/RaycastResult.js';
/**
 * @class WheelInfo
 * @constructor
 * @param {Object} [options]
 *
 * @param {Vec3} [options.chassisConnectionPointLocal]
 * @param {Vec3} [options.chassisConnectionPointWorld]
 * @param {Vec3} [options.directionLocal]
 * @param {Vec3} [options.directionWorld]
 * @param {Vec3} [options.axleLocal]
 * @param {Vec3} [options.axleWorld]
 * @param {number} [options.suspensionRestLength=1]
 * @param {number} [options.suspensionMaxLength=2]
 * @param {number} [options.radius=1]
 * @param {number} [options.suspensionStiffness=100]
 * @param {number} [options.dampingCompression=10]
 * @param {number} [options.dampingRelaxation=10]
 * @param {number} [options.frictionSlip=10000]
 * @param {number} [options.steering=0]
 * @param {number} [options.rotation=0]
 * @param {number} [options.deltaRotation=0]
 * @param {number} [options.rollInfluence=0.01]
 * @param {number} [options.maxSuspensionForce]
 * @param {boolean} [options.isFrontWheel=true]
 * @param {number} [options.clippedInvContactDotSuspension=1]
 * @param {number} [options.suspensionRelativeVelocity=0]
 * @param {number} [options.suspensionForce=0]
 * @param {number} [options.skidInfo=0]
 * @param {number} [options.suspensionLength=0]
 * @param {number} [options.maxSuspensionTravel=1]
 * @param {boolean} [options.useCustomSlidingRotationalSpeed=false]
 * @param {number} [options.customSlidingRotationalSpeed=-0.1]
 */
export default class WheelInfo {
    constructor(options) {
        /**
         * Max travel distance of the suspension, in meters.
         */
        this.maxSuspensionTravel = 1;
        /**
         * Speed to apply to the wheel rotation when the wheel is sliding.
         */
        this.customSlidingRotationalSpeed = -0.1;
        /**
         * If the customSlidingRotationalSpeed should be used.
         */
        this.useCustomSlidingRotationalSpeed = false;
        this.sliding = false;
        /**
         * Connection point, defined locally in the chassis body frame.
         */
        this.chassisConnectionPointLocal = new Vec3();
        this.chassisConnectionPointWorld = new Vec3();
        this.directionLocal = new Vec3();
        this.directionWorld = new Vec3();
        this.axleLocal = new Vec3();
        this.axleWorld = new Vec3();
        this.suspensionRestLength = 1;
        this.suspensionMaxLength = 2;
        this.radius = 1;
        this.suspensionStiffness = 100;
        this.dampingCompression = 10;
        this.dampingRelaxation = 10;
        this.frictionSlip = 1000;
        this.steering = 0;
        /**
         * Rotation value, in radians.
         */
        this.rotation = 0;
        this.deltaRotation = 0;
        this.rollInfluence = 0.01;
        this.maxSuspensionForce = Number.MAX_VALUE;
        this.engineForce = 0;
        this.brake = 0;
        this.isFrontWheel = true;
        this.clippedInvContactDotSuspension = 1;
        this.suspensionRelativeVelocity = 0;
        this.suspensionForce = 0;
        this.skidInfo = 0;
        this.suspensionLength = 0;
        this.sideImpulse = 0;
        this.forwardImpulse = 0;
        /**
         * The result from raycasting
         */
        this.raycastResult = new RaycastResult();
        /**
         * Wheel world transform
         */
        this.worldTransform = new Transform();
        this.isInContact = false;
        /*
        if(options){
            this.maxSuspensionTravel = options.maxSuspensionTravel;
            this.customSlidingRotationalSpeed = options.customSlidingRotationalSpeed;
            this.useCustomSlidingRotationalSpeed = options.useCustomSlidingRotationalSpeed;
            this.chassisConnectionPointLocal = options.chassisConnectionPointLocal.clone();
            this.chassisConnectionPointWorld = options.chassisConnectionPointWorld.clone();
            this.directionLocal = options.directionLocal.clone();
            this.directionWorld = options.directionWorld.clone();
            this.axleLocal = options.axleLocal.clone();
            this.axleWorld = options.axleWorld.clone();
            this.suspensionRestLength = options.suspensionRestLength;
            this.suspensionMaxLength = options.suspensionMaxLength;
            this.radius = options.radius;
            this.suspensionStiffness = options.suspensionStiffness;
            this.dampingCompression = options.dampingCompression;
            this.dampingRelaxation = options.dampingRelaxation;
            this.frictionSlip = options.frictionSlip;
            this.rollInfluence = options.rollInfluence;
            this.maxSuspensionForce = options.maxSuspensionForce;
            this.isFrontWheel = options.isFrontWheel;
        }
        */
    }
    updateWheel(chassis) {
        const raycastResult = this.raycastResult;
        if (this.isInContact) {
            const project = raycastResult.hitNormalWorld.dot(raycastResult.directionWorld);
            raycastResult.hitPointWorld.vsub(chassis.position, relpos);
            chassis.getVelocityAtWorldPoint(relpos, chassis_velocity_at_contactPoint);
            const projVel = raycastResult.hitNormalWorld.dot(chassis_velocity_at_contactPoint);
            if (project >= -0.1) {
                this.suspensionRelativeVelocity = 0.0;
                this.clippedInvContactDotSuspension = 1.0 / 0.1;
            }
            else {
                const inv = -1 / project;
                this.suspensionRelativeVelocity = projVel * inv;
                this.clippedInvContactDotSuspension = inv;
            }
        }
        else {
            // Not in contact : position wheel in a nice (rest length) position
            raycastResult.suspensionLength = this.suspensionRestLength;
            this.suspensionRelativeVelocity = 0.0;
            raycastResult.directionWorld.scale(-1, raycastResult.hitNormalWorld);
            this.clippedInvContactDotSuspension = 1.0;
        }
    }
}
var chassis_velocity_at_contactPoint = new Vec3();
var relpos = new Vec3();
var chassis_velocity_at_contactPoint = new Vec3();
