import AABB from '../src/collision/AABB';
import Vec3 from '../src/math/Vec3';
import Transform from '../src/math/Transform';

export default {
    construct(test) {
        new AABB();
        test.done();
    },

    copy(test) {
        const a = new AABB();
        const b = new AABB();
        a.upperBound.set(1, 2, 3);
        b.copy(a);
        test.deepEqual(a, b);
        test.done();
    },

    clone(test) {
        const a = new AABB({
            lowerBound: new Vec3(-1,-2,-3),
            upperBound: new Vec3(1,2,3)
        });
        const b = a.clone();

        test.deepEqual(a,b);

        test.equal(a === b, false);

        test.done();
    },

    extend(test) {
        let a = new AABB({
            lowerBound: new Vec3(-1,-1,-1),
            upperBound: new Vec3(1,1,1)
        });
        let b = new AABB({
            lowerBound: new Vec3(-2,-2,-2),
            upperBound: new Vec3(2,2,2)
        });
        a.extend(b);
        test.deepEqual(a,b);

        a = new AABB({
            lowerBound: new Vec3(-1,-1,-1),
            upperBound: new Vec3(1,1,1)
        });
        b = new AABB({
            lowerBound: new Vec3(-2,-2,-2),
            upperBound: new Vec3(2,2,2)
        });
        b.extend(a);
        test.deepEqual(b.lowerBound, new Vec3(-2,-2,-2));
        test.deepEqual(b.upperBound, new Vec3(2,2,2));

        a = new AABB({
            lowerBound: new Vec3(-2,-1,-1),
            upperBound: new Vec3(2,1,1)
        });
        b = new AABB({
            lowerBound: new Vec3(-1,-1,-1),
            upperBound: new Vec3(1,1,1)
        });
        b.extend(a);
        test.deepEqual(a.lowerBound, new Vec3(-2,-1,-1));
        test.deepEqual(a.upperBound, new Vec3(2,1,1));

        test.done();
    },

    overlaps(test) {
        const a = new AABB();
        const b = new AABB();

        // Same aabb
        a.lowerBound.set(-1, -1, 0);
        a.upperBound.set( 1,  1, 0);
        b.lowerBound.set(-1, -1, 0);
        b.upperBound.set( 1,  1, 0);
        test.ok(a.overlaps(b),'should detect overlap');

        // Corner overlaps
        b.lowerBound.set( 1,  1, 0);
        b.upperBound.set( 2,  2, 0);
        test.ok(a.overlaps(b),'should detect corner overlap');

        // Separate
        b.lowerBound.set( 1.1,  1.1, 0);
        test.ok(!a.overlaps(b),'should detect separated');

        // fully inside
        b.lowerBound.set(-0.5, -0.5, 0);
        b.upperBound.set( 0.5,  0.5, 0);
        test.ok(a.overlaps(b),'should detect if aabb is fully inside other aabb');
        b.lowerBound.set(-1.5, -1.5, 0);
        b.upperBound.set( 1.5,  1.5, 0);
        test.ok(a.overlaps(b),'should detect if aabb is fully inside other aabb');

        // Translated
        b.lowerBound.set(-3, -0.5, 0);
        b.upperBound.set(-2,  0.5, 0);
        test.ok(!a.overlaps(b),'should detect translated');

        test.done();
    },

    contains(test) {
        const a = new AABB();
        const b = new AABB();

        a.lowerBound.set(-1, -1, -1);
        a.upperBound.set( 1,  1, 1);
        b.lowerBound.set(-1, -1, -1);
        b.upperBound.set( 1,  1, 1);

        test.ok(a.contains(b));

        a.lowerBound.set(-2, -2, -2);
        a.upperBound.set( 2,  2, 2);

        test.ok(a.contains(b));

        b.lowerBound.set(-3, -3, -3);
        b.upperBound.set( 3,  3, 3);

        test.equal(a.contains(b), false);

        a.lowerBound.set(0, 0, 0);
        a.upperBound.set( 2,  2, 2);
        b.lowerBound.set(-1, -1, -1);
        b.upperBound.set( 1,  1, 1);

        test.equal(a.contains(b), false);

        test.done();
    },

    toLocalFrame(test) {
        const worldAABB = new AABB();
        const localAABB = new AABB();
        const frame = new Transform();

        worldAABB.lowerBound.set(-1, -1, -1);
        worldAABB.upperBound.set(1, 1, 1);

        // No transform - should stay the same
        worldAABB.toLocalFrame(frame, localAABB);
        test.deepEqual(localAABB, worldAABB);

        // Some translation
        frame.position.set(-1,0,0);
        worldAABB.toLocalFrame(frame, localAABB);
        test.deepEqual(
            localAABB,
            new AABB({
                lowerBound: new Vec3(0, -1, -1),
                upperBound: new Vec3(2, 1, 1)
            })
        );

        test.done();
    },

    toWorldFrame(test) {
        const localAABB = new AABB();
        const worldAABB = new AABB();
        const frame = new Transform();

        localAABB.lowerBound.set(-1, -1, -1);
        localAABB.upperBound.set(1, 1, 1);

        // No transform - should stay the same
        localAABB.toLocalFrame(frame, worldAABB);
        test.deepEqual(localAABB, worldAABB);

        // Some translation on the frame
        frame.position.set(1,0,0);
        localAABB.toWorldFrame(frame, worldAABB);
        test.deepEqual(
            worldAABB,
            new AABB({
                lowerBound: new Vec3(0, -1, -1),
                upperBound: new Vec3(2, 1, 1)
            })
        );

        test.done();
    },
};

