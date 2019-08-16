import ContactMaterial from '../src/material/ContactMaterial';
import Quaternion from "../src/math/Quaternion";
import Vec3 from "../src/math/Vec3";
import Body from '../src/objects/Body';
import Heightfield from '../src/shapes/heightfield';
import Sphere from '../src/shapes/Sphere';
import Narrowphase from '../src/world/Narrowphase';
import World from '../src/world/World';

export default {

    sphereSphere(test) {
        const world = new World();
        const cg = new Narrowphase(world);
        const result = [];
        const sphereShape = new Sphere(1);

        const bodyA = new Body({ mass: 1 });
        bodyA.addShape(sphereShape);
        const bodyB = new Body({ mass: 1 });
        bodyB.addShape(sphereShape);

        cg.currentContactMaterial = new ContactMaterial();
        cg.result = result;
        cg.sphereSphere(
            sphereShape,
            sphereShape,
            new Vec3(0.5, 0, 0),
            new Vec3(-0.5, 0, 0),
            new Quaternion(),
            new Quaternion(),
            bodyA,
            bodyB
        );

        test.equal(result.length, 1);

        test.done();
    },

    sphereHeightfield(test) {
        const world = new World();
        const cg = new Narrowphase(world);
        const result = [];
        const hfShape = createHeightfield();
        const sphereShape = new Sphere(0.1);
        cg.currentContactMaterial = new ContactMaterial();
        cg.result = result;
        cg.sphereHeightfield(
            sphereShape,
            hfShape,
            new Vec3(0.25, 0.25, 0.05), // hit the first triangle in the field
            new Vec3(0, 0, 0),
            new Quaternion(),
            new Quaternion(),
            new Body(1, sphereShape),
            new Body(1, hfShape)
        );

        test.equal(result.length, 1);

        test.done();
    },


};

function createHeightfield(){
    const matrix = [];
    const size = 20;
    for (let i = 0; i < size; i++) {
        matrix.push([]);
        for (let j = 0; j < size; j++) {
            matrix[i].push(0);
        }
    }
    const hfShape = new Heightfield(matrix, {
        elementSize: 1,
    });

    return hfShape;
}