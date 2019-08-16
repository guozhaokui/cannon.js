import Vec3 from "../src/math/Vec3";
import Quaternion from "../src/math/Quaternion";
import Plane from '../src/shapes/Plane';
import Trimesh from '../src/shapes/Trimesh';
import World from '../src/world/World';
import Body from '../src/objects/Body';
import AABB from '../src/collision/AABB';

export default {
    updateNormals(test) {
        const mesh = Trimesh.createTorus();
        mesh.normals[0] = 1;
        mesh.updateNormals();
        test.ok(mesh.normals[0] !== 1);
        test.done();
    },

    updateAABB(test) {
        const mesh = Trimesh.createTorus();
        mesh.aabb.lowerBound.set(1,2,3);
        mesh.updateAABB();
        test.ok(mesh.aabb.lowerBound.y !== 2);
        test.done();
    },

    updateTree: {
        scaled(test) {
            const mesh = Trimesh.createTorus();
            mesh.updateTree();

            const bigMesh = Trimesh.createTorus();
            bigMesh.setScale(new Vec3(2,2,2));

            test.equal(bigMesh.aabb.upperBound.x, mesh.aabb.upperBound.x * 2, 'AABB does not scale with the mesh!');

            test.equal(bigMesh.tree.aabb.upperBound.x, mesh.tree.aabb.upperBound.x, 'Octree AABB scales with the mesh, which is wrong!');

            test.done();
        }
    },

    getTrianglesInAABB: {
        unscaled(test) {
            const mesh = Trimesh.createTorus(1,1,32,32);
            const result = [];

            // Should get all triangles if we use the full AABB
            const aabb = mesh.aabb.clone();
            mesh.getTrianglesInAABB(aabb, result);
            test.equal(result.length, mesh.indices.length / 3);

            // Should get less triangles if we use the half AABB
            result.length = 0;
            aabb.lowerBound.scale(0.1, aabb.lowerBound);
            aabb.upperBound.scale(0.1, aabb.upperBound);
            mesh.getTrianglesInAABB(aabb, result);

            console.log(result.length, mesh.indices.length / 3)

            test.ok(result.length < mesh.indices.length / 3);

            test.done();
        },

        // scaled: function(test){
        //     var mesh = Trimesh.createTorus(1,1,16,16);
        //     var result = [];

        //     // Should get all triangles if we use the full AABB
        //     var aabb = mesh.aabb.clone();
        //     mesh.getTrianglesInAABB(aabb, result);
        //     test.equal(result.length, mesh.indices.length / 3);

        //     // Should get less triangles if we use the half AABB
        //     result.length = 0;
        //     aabb.lowerBound.scale(0.5, aabb.lowerBound);
        //     aabb.upperBound.scale(0.5, aabb.upperBound);
        //     mesh.getTrianglesInAABB(aabb, result);
        //     test.ok(result.length < mesh.indices.length / 3);

        //     test.done();
        // }
    },

    getVertex: {
        unscaled(test) {
            const mesh = Trimesh.createTorus();
            const vertex = new Vec3();
            mesh.getVertex(0, vertex);
            test.deepEqual(vertex, new Vec3(mesh.vertices[0], mesh.vertices[1], mesh.vertices[2]));
            test.done();
        },
        scaled(test) {
            const mesh = Trimesh.createTorus();
            mesh.setScale(new Vec3(1,2,3));
            const vertex = new Vec3();
            mesh.getVertex(0, vertex);
            test.deepEqual(vertex, new Vec3(1 * mesh.vertices[0], 2 * mesh.vertices[1], 3 * mesh.vertices[2]));
            test.done();
        }
    },

    getWorldVertex(test) {
        const mesh = Trimesh.createTorus();
        const vertex = new Vec3();
        mesh.getWorldVertex(0, new Vec3(), new Quaternion(), vertex);
        test.deepEqual(vertex, new Vec3(mesh.vertices[0], mesh.vertices[1], mesh.vertices[2]));
        test.done();
    },

    getTriangleVertices(test) {
        const mesh = Trimesh.createTorus();
        const va = new Vec3();
        const vb = new Vec3();
        const vc = new Vec3();
        const va1 = new Vec3();
        const vb1 = new Vec3();
        const vc1 = new Vec3();
        mesh.getVertex(mesh.indices[0], va);
        mesh.getVertex(mesh.indices[1], vb);
        mesh.getVertex(mesh.indices[2], vc);
        mesh.getTriangleVertices(0, va1, vb1, vc1);
        test.deepEqual(va, va1);
        test.deepEqual(vb, vb1);
        test.deepEqual(vc, vc1);
        test.done();
    },

    getNormal(test) {
        const mesh = Trimesh.createTorus();
        const normal = new Vec3();
        mesh.getNormal(0, normal);
        test.deepEqual(new Vec3(mesh.normals[0], mesh.normals[1], mesh.normals[2]), normal);
        test.done();
    },

    calculateLocalInertia(test) {
        const mesh = Trimesh.createTorus();
        const inertia = new Vec3();
        mesh.calculateLocalInertia(1, inertia);
        test.done();
    },

    computeLocalAABB(test) {
        console.warn('Trimesh::computeLocalAABB is todo');
        test.done();
    },

    updateBoundingSphereRadius(test) {
        console.warn('Trimesh::updateBoundingSphereRadius is todo');
        test.done();
    },

    calculateWorldAABB(test) {
        const poly = Trimesh.createTorus();
        const min = new Vec3();
        const max = new Vec3();
        poly.calculateWorldAABB(
            new Vec3(1,0,0), // Translate 2 x in world
            new Quaternion(0,0,0,1),
            min,
            max
        );
        test.ok(!isNaN(min.x));
        test.ok(!isNaN(max.x));
        test.done();
    },

    volume(test) {
        const mesh = Trimesh.createTorus();
        test.ok(mesh.volume() > 0);
        test.done();
    },

    narrowphaseAgainstPlane(test) {
        const world = new World();

        const torusShape = Trimesh.createTorus();
        const torusBody = new Body({
            mass: 1
        });
        torusBody.addShape(torusShape);

        const planeBody = new Body({
            mass: 1
        });
        planeBody.addShape(new Plane());

        world.addBody(torusBody);
        world.addBody(planeBody);

        world.step(1 / 60);

        test.done();
    }
};
