import Quaternion from "../src/math/Quaternion";
import Vec3 from "../src/math/Vec3";
import Heightfield from '../src/shapes/Heightfield';

export default {

    calculateWorldAABB(test) {
        const hfShape = createHeightfield({
            elementSize: 1,
            minValue: 0
        });
        const min = new Vec3();
        const max = new Vec3();
        hfShape.calculateWorldAABB(
            new Vec3(),
            new Quaternion(),
            min,
            max
        );

        test.equal(min.x, -Number.MAX_VALUE);
        test.equal(max.x, Number.MAX_VALUE);
        test.equal(min.y, -Number.MAX_VALUE);
        test.equal(max.y, Number.MAX_VALUE);

        test.done();
    },

    getConvexTrianglePillar(test) {
        const hfShape = createHeightfield({
            elementSize: 1,
            minValue: 0,
            size: 2
        });

        hfShape.getConvexTrianglePillar(0, 0, false);
        test.equal(hfShape.pillarConvex.vertices.length, 6);
        test.deepEqual(hfShape.pillarConvex.vertices.slice(0,3), [
            new Vec3(-0.25, -0.25, 0.5),
            new Vec3(0.75, -0.25, 0.5),
            new Vec3(-0.25, 0.75, 0.5)
        ]);
        test.deepEqual(hfShape.pillarOffset, new Vec3(0.25, 0.25, 0.5));

        hfShape.getConvexTrianglePillar(0, 0, true);
        test.equal(hfShape.pillarConvex.vertices.length, 6);
        test.deepEqual(hfShape.pillarConvex.vertices.slice(0,3), [
            new Vec3(0.25, 0.25, 0.5),
            new Vec3(-0.75, 0.25, 0.5),
            new Vec3(0.25, -0.75, 0.5)
        ]);
        test.deepEqual(hfShape.pillarOffset, new Vec3(0.75, 0.75, 0.5));

        // Out of bounds
        test.throws(() => {
            hfShape.getConvexTrianglePillar(1, 1, true);
        }, Error);
        test.throws(() => {
            hfShape.getConvexTrianglePillar(1, 1, false);
        }, Error);
        test.throws(() => {
            hfShape.getConvexTrianglePillar(-1, 0, false);
        }, Error);

        test.done();
    },

    getTriangle(test) {
        const hfShape = createHeightfield({
            elementSize: 1,
            minValue: 0,
            size: 2
        });
        const a = new Vec3();
        const b = new Vec3();
        const c = new Vec3();

        hfShape.getTriangle(0, 0, false, a, b, c);
        test.deepEqual(a, new Vec3(0, 0, 1));
        test.deepEqual(b, new Vec3(1, 0, 1));
        test.deepEqual(c, new Vec3(0, 1, 1));

        hfShape.getTriangle(0, 0, true, a, b, c);
        test.deepEqual(a, new Vec3(1, 1, 1));
        test.deepEqual(b, new Vec3(0, 1, 1));
        test.deepEqual(c, new Vec3(1, 0, 1));

        test.done();
    },

    getRectMinMax(test) {
        const hfShape = createHeightfield();
        const minMax = [];
        hfShape.getRectMinMax(0,0,1,1,minMax);
        test.deepEqual(minMax, [1,1]);
        test.done();
    },

    getHeightAt(test) {
        const hfShape = createHeightfield({
            size: 2,
            elementSize: 1,
            linear: true
        });
        console.warn('add more tests here');
        const h0 = hfShape.getHeightAt(0, 0);
        const h1 = hfShape.getHeightAt(0.25, 0.25);
        const h2 = hfShape.getHeightAt(0.75, 0.75);
        const h3 = hfShape.getHeightAt(0.99, 0.99);

        test.equal(h0, 0);
        test.ok(h0 < h1);
        test.ok(h1 < h2);
        test.ok(h2 < h3);

        test.done();
    },

    update(test) {
        const hfShape = createHeightfield();
        hfShape.update();
        test.done();
    },

    updateMaxValue(test) {
        const hfShape = createHeightfield();
        hfShape.data[0][0] = 10;
        hfShape.updateMaxValue();
        test.equal(hfShape.maxValue, 10);
        test.done();
    },

    updateMinValue(test) {
        const hfShape = createHeightfield();
        hfShape.data[0][0] = -10;
        hfShape.updateMinValue();
        test.equal(hfShape.minValue, -10);
        test.done();
    },

    setHeightValueAtIndex(test) {
        const hfShape = createHeightfield();
        hfShape.setHeightValueAtIndex(0, 0, 10);
        test.equal(hfShape.data[0][0], 10);
        test.done();
    },

    getIndexOfPosition(test) {
        const hfShape = createHeightfield();
        const result = [];
        hfShape.getIndexOfPosition(0, 0, result);
        test.deepEqual(result, [0,0]);
        test.done();
    },
};

function createHeightfield(options = {}) {
    const matrix = [];
    const size = options.size || 20;
    for (let i = 0; i < size; i++) {
        matrix.push([]);
        for (let j = 0; j < size; j++) {
            if(options.linear){
                matrix[i].push(i + j);
            } else {
                matrix[i].push(1);
            }
        }
    }
    const hfShape = new Heightfield(matrix, options);

    return hfShape;
}