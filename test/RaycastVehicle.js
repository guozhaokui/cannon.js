import Vec3 from "../src/math/Vec3";
import Body from '../src/objects/Body';
import RaycastVehicle from '../src/objects/RaycastVehicle';
import Plane from '../src/shapes/Plane';
import World from '../src/world/World';

export default {

    construct(test) {
        const vehicle = new RaycastVehicle({
            chassisBody: new Body()
        });
        test.done();
    },

    addWheel(test) {
        const vehicle = new RaycastVehicle({
            chassisBody: new Body()
        });
        vehicle.addWheel({});
        test.equal(vehicle.wheelInfos.length, 1);
        test.done();
    },

    addWheel(test) {
        const vehicle = new RaycastVehicle({
            chassisBody: new Body()
        });
        vehicle.addWheel({});
        test.equal(vehicle.wheelInfos.length, 1);
        vehicle.addWheel({});
        test.equal(vehicle.wheelInfos.length, 2);
        test.done();
    },

    setSteeringValue(test) {
        const vehicle = createVehicle();
        vehicle.setSteeringValue(Math.PI / 4, 0);
        test.done();
    },

    applyEngineForce(test) {
        const vehicle = createVehicle();
        vehicle.applyEngineForce(1000, 0);
        test.done();
    },

    setBrake(test) {
        const vehicle = createVehicle();
        vehicle.applyEngineForce(1000, 0);
        test.done();
    },

    updateSuspension(test) {
        const vehicle = createVehicle();
        vehicle.updateSuspension(1 / 60);
        test.done();
    },

    updateFriction(test) {
        const vehicle = createVehicle();
        vehicle.updateFriction(1 / 60);
        test.done();
    },

    updateWheelTransform(test) {
        const vehicle = createVehicle();
        vehicle.updateWheelTransform(0);
        test.done();
    },

    updateVehicle(test) {
        const vehicle = createVehicle();
        vehicle.updateVehicle(1 / 60);
        test.done();
    },

    getVehicleAxisWorld(test) {
        const vehicle = createVehicle();
        const v = new Vec3();

        vehicle.getVehicleAxisWorld(0, v);
        test.deepEqual(v, new Vec3(1, 0, 0));

        vehicle.getVehicleAxisWorld(1, v);
        test.deepEqual(v, new Vec3(0, 1, 0));

        vehicle.getVehicleAxisWorld(2, v);
        test.deepEqual(v, new Vec3(0, 0, 1));

        test.done();
    },

    removeFromWorld(test) {
        const world = new World();
        const vehicle = new RaycastVehicle({
            chassisBody: new Body({ mass: 1 })
        });

        vehicle.addToWorld(world);
        test.ok(world.bodies.includes(vehicle.chassisBody));
        test.ok(world.hasEventListener('preStep', vehicle.preStepCallback));

        vehicle.removeFromWorld(world);
        test.ok(!world.bodies.includes(vehicle.chassisBody));
        test.ok(!world.hasEventListener('preStep', vehicle.preStepCallback));

        test.done();
    }
};


function createVehicle(){
    const vehicle = new RaycastVehicle({
        chassisBody: new Body({
            mass: 1
        })
    });
    const down = new Vec3(0, 0, -1);
    const info = {
        chassisConnectionPointLocal: new Vec3(-5, -1 / 2, 0),
        axleLocal: new Vec3(0, -1, 0),
        directionLocal: down,
        suspensionStiffness: 1000,
        suspensionRestLength: 2,
    };
    vehicle.addWheel(info);

    const world = new World();
    const planeBody = new Body();
    planeBody.position.z = -1;
    planeBody.addShape(new Plane());
    world.addBody(planeBody);

    vehicle.addToWorld(world);

    return vehicle;
}