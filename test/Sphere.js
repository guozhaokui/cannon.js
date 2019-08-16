import Sphere from '../src/shapes/Sphere';

export default {
    throwOnWrongRadius(test) {

        // These should be all right
        new Sphere(1);
        new Sphere(0);

        test.throws(() => {
            new Sphere(-1);
        }, Error, 'Should throw on negative radius');

        test.done();
    }
};
