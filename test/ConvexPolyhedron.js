import Vec3 from "../src/math/Vec3";
import Quaternion from "../src/math/Quaternion";
import Box from '../src/shapes/Box';
import ConvexPolyhedron from '../src/shapes/ConvexPolyhedron';

function createBoxHull(size = 0.5) {
    const box = new Box(new Vec3(size,size,size));
    return box.convexPolyhedronRepresentation;
}

export default {
    calculateWorldAABB(test) {
        const poly = createPolyBox(1,1,1);
        const min = new Vec3();
        const max = new Vec3();
        poly.calculateWorldAABB(new Vec3(1,0,0), // Translate 2 x in world
                                new Quaternion(0,0,0,1),
                                min,
                                max);
        test.equal(min.x,0);
        test.equal(max.x,2);
        test.equal(min.y,-1);
        test.equal(max.y, 1);
        test.done();
    },

    clipFaceAgainstPlane(test) {
        const h = createBoxHull();

        // Four points 1 unit below the plane z=0 - we assume to get back 4
        let inverts = [  new Vec3(-0.2,-0.2,-1),
                         new Vec3(-0.2, 0.2,-1),
                         new Vec3( 0.2, 0.2,-1),
                         new Vec3( 0.2,-0.2,-1)];
        let outverts=[];
        h.clipFaceAgainstPlane(inverts,outverts,new Vec3(0,0,1), 0.0);
        test.equal(outverts.length,4,"did not get the assumed 4 vertices");
        inverts=[];
        outverts=[];

        // Lower the plane to z=-2, we assume no points back
        h.clipFaceAgainstPlane(inverts,outverts,new Vec3(0,0,1),2);
        test.equal(outverts.length,0,"got more than zero vertices left after clipping!");

        // two points below, two over. We get four points back, though 2 of them are clipped to
        // the back of the  plane
        const inverts2 = [new Vec3(-2, -2,  1),
                        new Vec3(-2,  2,  1),
                        new Vec3( 2,  2, -1),
                        new Vec3( 2, -2, -1)];
        outverts = [];
        h.clipFaceAgainstPlane(inverts2,outverts,new Vec3(0,0,1),0.0);
        test.equal(outverts.length,4,`Expected 4 points back from clipping a quad with plane, got ${outverts.length}`);
        test.done();
    },

    clipFaceAgainstHull(test) {
        // Create box
        const hullA = createBoxHull(0.5);
        const res = [];
        const sepNormal = new Vec3(0,0,1);

        // Move the box 0.45 units up - only 0.05 units of the box will be below plane z=0
        const posA = new Vec3(0,0,0.45);

        const quatA = new Quaternion();

        // All points from B is in the plane z=0
        const worldVertsB = [ new Vec3(-1.0,-1.0,0),
                            new Vec3(-1.0, 1.0,0),
                            new Vec3( 1.0, 1.0,0),
                            new Vec3( 1.0,-1.0,0)];

        // We will now clip a face in hullA that is closest to the sepNormal
        // against the points in worldVertsB.
        // We can expect to get back the 4 corners of the box hullA penetrated 0.05 units
        // into the plane worldVertsB we constructed
        hullA.clipFaceAgainstHull(sepNormal,posA,quatA,worldVertsB,-100,100,res);
        test.done();
    },

    clipAgainstHull(test) {
        const hullA = createBoxHull(0.6);
        const posA = new Vec3(-0.5,0,0);
        const quatA = new Quaternion();
        const hullB = createBoxHull(0.5);
        const posB = new Vec3(0.5,0,0);
        const quatB = new Quaternion();

        const sepaxis = new Vec3();
        const found = hullA.findSeparatingAxis(hullB,posA,quatA,posB,quatB,sepaxis);
        const result = [];
        //hullA.clipAgainstHull(posA,quatA,hullB,posB,quatB,sepaxis,-100,100,result);
        quatB.setFromAxisAngle(new Vec3(0,0,1),Math.PI/4);
        //console.log("clipping....");
        hullA.clipAgainstHull(posA,quatA,hullB,posB,quatB,sepaxis,-100,100,result);
        //console.log("result:",result);
        //console.log("done....");
        test.done();
    },

    testSepAxis(test) {
        test.expect(3);
        const hullA = createBoxHull(0.5);
        const posA = new Vec3(-0.2,0,0);
        const quatA = new Quaternion();
        const hullB = createBoxHull();
        const posB = new Vec3(0.2,0,0);
        const quatB = new Quaternion();

        const sepAxis = new Vec3(1,0,0);
        const found1 = hullA.testSepAxis(sepAxis,hullB,posA,quatA,posB,quatB);
        test.equal(found1,0.6,"didnt find sep axis depth");

        // Move away
        posA.x = -5;
        const found2 = hullA.testSepAxis(sepAxis,hullB,posA,quatA,posB,quatB);
        test.equal(found2,false,"found separating axis though there are none");

        // Inclined 45 degrees, what happens then?
        posA.x = 1;
        quatB.setFromAxisAngle(new Vec3(0,0,1),Math.PI/4);
        const found3 = hullA.testSepAxis(sepAxis,hullB,posA,quatA,posB,quatB);
        test.ok(typeof(found3),"number","Did not fetch");

        test.done();
    },

    findSepAxis(test) {
        const hullA = createBoxHull();
        const posA = new Vec3(-0.2,0,0);
        const quatA = new Quaternion();
        const hullB = createBoxHull();
        const posB = new Vec3(0.2,0,0);
        const quatB = new Quaternion();

        const sepaxis = new Vec3();
        const found = hullA.findSeparatingAxis(hullB,posA,quatA,posB,quatB,sepaxis);
        //console.log("SepAxis found:",found,", the axis:",sepaxis.toString());

        quatB.setFromAxisAngle(new Vec3(0,0,1),Math.PI/4);
        const found2 = hullA.findSeparatingAxis(hullB,posA,quatA,posB,quatB,sepaxis);
        //console.log("SepAxis found:",found2,", the axis:",sepaxis.toString());

        test.done();
    },

    project(test) {
        const convex = createBoxHull(0.5);
        const pos = new Vec3(0, 0, 0);
        const quat = new Quaternion();

        const axis = new Vec3(1, 0, 0);
        const result = [];

        ConvexPolyhedron.project(convex, axis, pos, quat, result);
        test.deepEqual(result, [0.5, -0.5]);

        axis.set(-1, 0, 0);
        ConvexPolyhedron.project(convex, axis, pos, quat, result);
        test.deepEqual(result, [0.5, -0.5]);

        axis.set(0, 1, 0);
        ConvexPolyhedron.project(convex, axis, pos, quat, result);
        test.deepEqual(result, [0.5, -0.5]);

        pos.set(0, 1, 0);
        axis.set(0, 1, 0);
        ConvexPolyhedron.project(convex, axis, pos, quat, result);
        test.deepEqual(result, [1.5, 0.5]);

        // Test to rotate
        quat.setFromAxisAngle(new Vec3(1, 0, 0), Math.PI / 2);
        pos.set(0, 1, 0);
        axis.set(0, 1, 0);
        ConvexPolyhedron.project(convex, axis, pos, quat, result);
        test.ok(Math.abs(result[0] - 1.5) < 0.01);
        test.ok(Math.abs(result[1] - 0.5) < 0.01);

        test.done();
    },


};

function createPolyBox(sx,sy,sz){
    const v = Vec3;
    const box = new Box(new Vec3(sx,sy,sz));
    return box.convexPolyhedronRepresentation;
}
