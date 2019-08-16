import Ray from '../src/collision/Ray';
import RaycastResult from '../src/collision/RaycastResult';
import Quaternion from "../src/math/Quaternion";
import Vec3 from "../src/math/Vec3";
import Body from '../src/objects/Body';
import Box from '../src/shapes/Box';
import Heightfield from '../src/shapes/Heightfield';
import Plane from '../src/shapes/Plane';
import Sphere from '../src/shapes/Sphere';
import Trimesh from '../src/shapes/Trimesh';

export default {

    construct(test) {
        test.expect(0);
        const r = new Ray(new Vec3(), new Vec3(1,0,0));
        test.done();
    },

    intersectBody(test) {
        var r = new Ray(new Vec3(5,0,0), new Vec3(-5, 0, 0));
        r.skipBackfaces = true;
        const shape = createPolyhedron(0.5);
        const body = new Body({ mass: 1 });
        body.addShape(shape);

        const result = new RaycastResult();

        r.intersectBody(body, result);
        test.ok(result.hasHit);
        test.ok(result.hitPointWorld.almostEquals(new Vec3(0.5, 0, 0)));

        // test rotating the body first
        result.reset();
        body.quaternion.setFromAxisAngle(new Vec3(1,0,0), Math.PI);
        r.intersectBody(body, result);
        test.equals(result.hasHit, true);
        test.ok(result.hitPointWorld.almostEquals(new Vec3(0.5,0,0)));

        // test shooting from other direction
        result.reset();
        r.to.set(0,0,-5);
        r.from.set(0,0,5);
        r.intersectBody(body, result);
        test.equals(result.hasHit, true);
        test.ok(result.hitPointWorld.almostEquals(new Vec3(0,0,0.5)));

        // test miss
        result.reset();
        var r = new Ray(new Vec3(5, 1, 0), new Vec3(-5, 1, 0));
        r.intersectBody(body, result);
        test.equals(result.hasHit, false);

        test.done();
    },

    intersectBodies(test) {
        const r = new Ray(new Vec3(5,0,0), new Vec3(-5,0,0));
        r.skipBackfaces = true;
        const shape = createPolyhedron(0.5);
        const body1 = new Body({ mass: 1 });
        body1.addShape(shape);
        const body2 = new Body({ mass: 1 });
        body2.addShape(shape);
        body2.position.x = -2;

        const result = new RaycastResult();
        r.intersectBodies([body1, body2], result);
        test.equals(result.hasHit, true);
        test.ok(result.hitPointWorld.almostEquals(new Vec3(0.5,0,0)));
        test.done();
    },

    box(test) {
        const r = new Ray(new Vec3(5,0,0),new Vec3(-5, 0, 0));
        r.skipBackfaces = true;
        const shape = new Box(new Vec3(0.5,0.5,0.5));
        const body = new Body({ mass: 1 });
        body.addShape(shape);
        const result = new RaycastResult();

        r.intersectBody(body, result);
        test.equals(result.hasHit, true);
        test.ok(result.hitPointWorld.almostEquals(new Vec3(0.5,0,0)));

        result.reset();
        body.quaternion.setFromAxisAngle(new Vec3(1,0,0), Math.PI / 2);
        r.intersectBody(body, result);
        test.equals(result.hasHit, true);
        test.ok(result.hitPointWorld.almostEquals(new Vec3(0.5,0,0)));

        result.reset();
        body.quaternion.setFromAxisAngle(new Vec3(1,0,0), Math.PI);
        r.intersectBody(body, result);
        test.equals(result.hasHit, true);
        test.ok(result.hitPointWorld.almostEquals(new Vec3(0.5,0,0)));

        result.reset();
        body.quaternion.setFromAxisAngle(new Vec3(1,0,0), 3 * Math.PI / 2);
        r.intersectBody(body, result);
        test.equals(result.hasHit, true);
        test.ok(result.hitPointWorld.almostEquals(new Vec3(0.5,0,0)));

        test.done();
    },

    sphere(test) {
        const r = new Ray(new Vec3(5,0,0), new Vec3(-5, 0, 0));
        r.skipBackfaces = true;
        const shape = new Sphere(1);
        const body = new Body({ mass: 1 });
        body.addShape(shape);

        const result = new RaycastResult();
        r.intersectBody(body, result);
        test.equals(result.hasHit, true);
        test.ok(result.hitPointWorld.almostEquals(new Vec3(1,0,0)));

        result.reset();
        body.position.set(1, 0, 0);
        r.intersectBody(body, result);
        test.equals(result.hasHit, true);
        test.ok(result.hitPointWorld.almostEquals(new Vec3(2,0,0)));

        result.reset();
        r.intersectBody(body, result);
        test.equals(result.hasHit, true);
        test.ok(result.hitPointWorld.almostEquals(new Vec3(2,0,0)));

        result.reset();
        const shape2 = new Sphere(1);
        const body2 = new Body({ mass: 1 });
        body2.addShape(shape2, new Vec3(1, 0, 0));
        r.intersectBody(body2, result);
        test.equals(result.hasHit, true);
        test.ok(result.hitPointWorld.almostEquals(new Vec3(2,0,0)));

        test.done();
    },

    heightfield(test) {
        const r = new Ray(new Vec3(0, 0, 10), new Vec3(0, 0, -10));
        r.skipBackfaces = true;
        const data = [
            [1, 1, 1],
            [1, 1, 1],
            [1, 1, 1]
        ];
        const shape = new Heightfield(data, {
            elementSize: 1
        });
        const body = new Body({ mass: 1 }, new Vec3(-1, -1, 0));
        body.addShape(shape);

        // Hit
        var result = new RaycastResult();
        r.intersectBody(body, result);
        test.equals(result.hasHit, true);
        test.deepEqual(result.hitPointWorld, new Vec3(0, 0, 1));

        // Miss
        var result = new RaycastResult();
        r.from.set(-100, -100, 10);
        r.to.set(-100, -100, -10);
        r.intersectBody(body, result);
        test.equals(result.hasHit, false);

        // Hit all triangles!
        var result = new RaycastResult();
        for(let i = 0; i < data.length - 1; i++){ // 3x3 data points will have 2x2 rectangles in the field
            for(let j = 0; j < data[i].length - 1; j++){
                for(let k = 0; k < 2; k++){
                    result.reset();
                    r.from.set(i + 0.25, j + 0.25, 10);
                    r.to.set(i + 0.25, j + 0.25, -10);
                    if (k) {
                        r.from.x += 0.5;
                        r.from.y += 0.5;
                        r.to.x += 0.5;
                        r.to.y += 0.5;
                    }
                    r.intersectBody(body, result);
                    test.ok(result.hasHit, `missed triangle ${[i, j].join(',')}`);
                }
            }
        }

        test.done();
    },

    plane(test) {
        var r = new Ray(new Vec3(0,0,5), new Vec3(0, 0, -5));
        r.skipBackfaces = true;
        const shape = new Plane();
        const body = new Body({ mass: 1 });
        body.addShape(shape);

        var result = new RaycastResult();
        r.intersectBody(body, result);
        test.equals(result.hasHit, true);
        test.ok(result.hitPointWorld.almostEquals(new Vec3(0,0,0)));
        test.equal(result.distance, 5);

        result.reset();
        const body2 = new Body({ mass: 1 });
        body2.addShape(shape, new Vec3(0, 0, 1), new Quaternion());
        r.intersectBody(body2, result);
        test.equals(result.hasHit, true);
        test.ok(result.hitPointWorld.almostEquals(new Vec3(0,0,1)));

        result.reset();
        const body3 = new Body({ mass: 1 });
        const quat = new Quaternion();
        quat.setFromAxisAngle(new Vec3(1, 0, 0), Math.PI / 2);
        body3.addShape(shape, new Vec3(), quat);
        r.intersectBody(body3, result);
        test.equals(result.hasHit, false);

        result.reset();
        const body4 = new Body({ mass: 1 });
        body4.addShape(shape);
        var r = new Ray(new Vec3(1, 1, 5), new Vec3(1, 1, -5));
        r.intersectBody(body4, result);
        test.equals(result.hasHit, true);
        test.deepEqual(result.hitPointWorld, new Vec3(1, 1, 0));
        test.equal(result.distance, 5);

        var result = new RaycastResult();
        r.from.set(0, 1, 1);
        r.to.set(0, -1, -1);
        body.position.set(0, 0, 0);
        r.intersectBody(body, result);
        const distance1 = result.distance;
        test.equals(result.hasHit, true);
        test.ok(result.hitPointWorld.almostEquals(new Vec3(0,0,0)));

        var result = new RaycastResult();
        r.from.set(0, 1 - 5, 1);
        r.to.set(0, -1 - 5, -1);
        body.position.set(0, 0, 0);
        r.intersectBody(body, result);
        const distance2 = result.distance;
        test.equals(result.hasHit, true);
        test.ok(result.hitPointWorld.almostEquals(new Vec3(0,-5,0)));
        test.equal(distance1, distance2);

        test.done();
    },


    trimesh(test) {
        const r = new Ray(new Vec3(0.5, 0.5, 10), new Vec3(0.5, 0.5, -10));
        r.skipBackfaces = true;

        const vertices = [
            0, 0, 0,
            1, 0, 0,
            0, 1, 0
        ];
        const indices = [
            0, 1, 2
        ];

        const body = new Body({
            mass: 1,
            shape: new Trimesh(vertices, indices)
        });

        // Hit
        let result = new RaycastResult();
        r.intersectBody(body, result);
        test.equals(result.hasHit, true);
        test.deepEqual(result.hitPointWorld, new Vec3(0.5, 0.5, 0));

        // Miss
        result = new RaycastResult();
        r.from.set(-100, -100, 10);
        r.to.set(-100, -100, -10);
        r.intersectBody(body, result);
        test.equals(result.hasHit, false);

        test.done();
    },

};

function createPolyhedron(size = 0.5) {
    const box = new Box(new Vec3(size,size,size));
    box.updateConvexPolyhedronRepresentation();
    return box.convexPolyhedronRepresentation;
}
