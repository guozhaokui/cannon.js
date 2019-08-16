import Vec3 from "../src/math/Vec3";
import Quaternion from "../src/math/Quaternion";
import Box from '../src/shapes/Box';

export default {
    forEachWOrldCorner(test) {
        const box = new Box(new Vec3(1,1,1));
        const pos = new Vec3();
        const quat = new Quaternion();
        quat.setFromAxisAngle(new Vec3(0,0,1),Math.PI*0.25);
        let numCorners = 0;
        const unique = [];
        box.forEachWorldCorner(pos,quat,(x, y, z) => {
            const corner = new Vec3(x,y,z);
            for(let i=0; i<unique.length; i++){
                test.ok(!corner.almostEquals(unique[i]),`Corners ${i} and ${numCorners} are almost equal: (${unique[i].toString()}) == (${corner.toString()})`);
            }
            unique.push(corner);
            numCorners++;
        });
        test.equal(numCorners,8);
        test.done();
    },

    calculateWorldAABB(test) {
        const box = new Box(new Vec3(1,1,1));
        const min = new Vec3();
        const max = new Vec3();
        box.calculateWorldAABB(new Vec3(3,0,0),
                               new Quaternion(0,0,0,1),
                               min,
                               max);
        test.equal(min.x,2);
        test.equal(max.x,4);
        test.equal(min.y,-1);
        test.equal(max.y, 1);
        test.done();
    }
};
