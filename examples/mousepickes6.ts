import  World from "../src/world/World.js";
import NaiveBroadphase from "../src/collision/NaiveBroadphase.js";
import Box from "../src/shapes/Box.js";
import Vec3 from "../src/math/Vec3.js";
import Plane from "../src/shapes/Plane.js";
import Sphere from "../src/shapes/Sphere.js";
import PointToPointConstraint from '../src/constraints/PointToPointConstraint.js';
import Body from "../src/objects/Body.js";
import GSSolver from "../src/solver/GSSolver.js";


var world:World;
var dt = 1 / 60;

var constraintDown = false;
var camera:THREE.Camera, scene:THREE.Scene, renderer:THREE.WebGLRenderer, gplane:THREE.Mesh, clickMarker:THREE.Mesh;
var geometry, material, mesh;
var controls,time = Date.now();
var markerMaterial;
var jointBody:Body, constrainedBody:Body, mouseConstraint:PointToPointConstraint;

var N = 1;

var container, projector;

// To be synced
var meshes=[], bodies=[];
// Initialize Three.js

initCannon();
init();
animate();

function init() {
    //@ts-ignore
    projector = new THREE.Projector();
    container = document.createElement( 'div' );
    document.body.appendChild( container );

    // scene
    scene = new THREE.Scene();
    scene.fog = new THREE.Fog( 0x000000, 500, 10000 );

    // camera
    camera = new THREE.PerspectiveCamera( 30, window.innerWidth / window.innerHeight, 0.5, 10000 );
    camera.position.set(10, 2, 0);
    camera.quaternion.setFromAxisAngle(new THREE.Vector3(0,1,0), Math.PI/2);
    scene.add(camera);

    // lights
    var light:THREE.DirectionalLight, materials:THREE.Material;
    scene.add( new THREE.AmbientLight( 0x666666 ) );

    light = new THREE.DirectionalLight( 0xffffff, 1.75 );
    var d = 20;

    light.position.set( d, d, d );

    light.castShadow = true;
    //light.shadowCameraVisible = true;

    light.shadowMapWidth = 1024;
    light.shadowMapHeight = 1024;

    light.shadowCameraLeft = -d;
    light.shadowCameraRight = d;
    light.shadowCameraTop = d;
    light.shadowCameraBottom = -d;

    light.shadowCameraFar = 3*d;
    light.shadowCameraNear = d;
    (light as any).shadowDarkness = 0.5;

    scene.add( light );

    // floor
    geometry = new THREE.PlaneGeometry( 100, 100, 1, 1 );
    //geometry.applyMatrix( new THREE.Matrix4().makeRotationX( -Math.PI / 2 ) );
    material = new THREE.MeshLambertMaterial( { color: 0x777777 } );
    markerMaterial = new THREE.MeshLambertMaterial( { color: 0xff0000 } );
    //THREE.ColorUtils.adjustHSV( material.color, 0, 0, 0.9 );
    mesh = new THREE.Mesh( geometry, material );
    mesh.castShadow = true;
    mesh.quaternion.setFromAxisAngle(new THREE.Vector3(1,0,0), -Math.PI / 2);
    mesh.receiveShadow = true;
    scene.add(mesh);


    renderer = new THREE.WebGLRenderer( { antialias: true } );
    renderer.setSize( window.innerWidth, window.innerHeight );
    renderer.setClearColor( scene.fog.color );

    container.appendChild( renderer.domElement );

    renderer.gammaInput = true;
    renderer.gammaOutput = true;
    renderer.shadowMapEnabled = true;

    window.addEventListener( 'resize', onWindowResize, false );

    window.addEventListener("mousemove", onMouseMove, false );
    window.addEventListener("mousedown", onMouseDown, false );
    window.addEventListener("mouseup", onMouseUp, false );

    //addBox(1,1,1,0,0,0);
    //addStack(0,0,2);
    addSphere(0.1,0,7,0);
}

function setClickMarker(x,y,z) {
    if(!clickMarker){
        var shape = new THREE.SphereGeometry(0.2, 8, 8);
        clickMarker = new THREE.Mesh(shape, markerMaterial);
        scene.add(clickMarker);
    }
    clickMarker.visible = true;
    clickMarker.position.set(x,y,z);
}

function removeClickMarker(){
    clickMarker && (clickMarker.visible = false);
}

function onMouseMove(e:MouseEvent){
    // Move and project on the plane
    if (gplane && mouseConstraint) {
        var pos = projectOntoPlane(e.clientX,e.clientY,gplane,camera);
        if(pos){
            setClickMarker(pos.x,pos.y,pos.z);
            moveJointToPoint(pos.x,pos.y,pos.z);
        }
    }
}

function onMouseDown(e:MouseEvent){
    // Find mesh from a ray
    var entity = findNearestIntersectingObject(e.clientX,e.clientY,camera,meshes);
    var pos = entity.point;
    if(pos && entity.object.geometry instanceof THREE.BoxGeometry){
        constraintDown = true;
        // Set marker on contact point
        setClickMarker(pos.x,pos.y,pos.z);

        // Set the movement plane
        setScreenPerpCenter(pos,camera);

        var idx = meshes.indexOf(entity.object);
        if(idx !== -1){
            addMouseConstraint(pos.x,pos.y,pos.z,bodies[idx]);
        }
    }
}

// This function creates a virtual movement plane for the mouseJoint to move in
function setScreenPerpCenter(point:THREE.Vector3, camera:THREE.Camera) {
    // If it does not exist, create a new one
    if(!gplane) {
        var planeGeo = new THREE.PlaneGeometry(100,100);
        var plane = gplane = new THREE.Mesh(planeGeo,material);
        plane.visible = false; // Hide it..
        scene.add(gplane);
    }

    // Center at mouse position
    gplane.position.copy(point);
    // Make it face toward the camera
    gplane.quaternion.copy(camera.quaternion);
}

function onMouseUp(e:MouseEvent) {
    constraintDown = false;
    // remove the marker
    removeClickMarker();

    // Send the remove mouse joint to server
    removeJointConstraint();
}

var lastx:number,lasty:number,last:number;
function projectOntoPlane(screenX:number,screenY:number,thePlane,camera:THREE.Camera) {
    var x = screenX;
    var y = screenY;
    var now = new Date().getTime();
    // project mouse to that plane
    var hit = findNearestIntersectingObject(screenX,screenY,camera,[thePlane]);
    lastx = x;
    lasty = y;
    last = now;
    if(hit)
        return hit.point;
    return false;
}

function findNearestIntersectingObject(clientX:number,clientY:number,camera:THREE.Camera,objects):{point:THREE.Vector3,object:any} {
    // Get the picking ray from the point
    var raycaster = getRayCasterFromScreenCoord(clientX, clientY, camera, projector);

    // Find the closest intersecting object
    // Now, cast the ray all render objects in the scene to see if they collide. Take the closest one.
    var hits:any[] = raycaster.intersectObjects(objects);
    var closest =null;
    if (hits.length > 0) {
        closest = hits[0];
    }

    return closest;
}

// Function that returns a raycaster to use to find intersecting objects
// in a scene given screen pos and a camera, and a projector
function getRayCasterFromScreenCoord (screenX:number, screenY:number, camera:THREE.Camera, projector) {
    var mouse3D = new THREE.Vector3();
    // Get 3D point form the client x y
    mouse3D.x = (screenX / window.innerWidth) * 2 - 1;
    mouse3D.y = -(screenY / window.innerHeight) * 2 + 1;
    mouse3D.z = 0.5;
    return projector.pickingRay(mouse3D, camera);
}

function onWindowResize() {
    //@ts-ignore
    camera.aspect = window.innerWidth / window.innerHeight;
    //@ts-ignore
    camera.updateProjectionMatrix();
    //controls.handleResize();
    renderer.setSize( window.innerWidth, window.innerHeight );
}

function animate() {
    requestAnimationFrame( animate );
    //controls.update();
    updatePhysics();
    render();
}

function updatePhysics(){
    world.step(dt);
    for(var i=0; i !== meshes.length; i++){
        meshes[i].position.copy(bodies[i].position);
        meshes[i].quaternion.copy(bodies[i].quaternion);
    }
}

function render() {
    renderer.render(scene, camera);
}

function addBox(sx:number,sy:number,sz:number,px:number,py:number,pz:number){
    //phy
    var body = new Body({mass:0.5});
    var boxshape = new Box(new Vec3(sz/2,sz/2,sz/2));
    body.addShape(boxshape);
    body.allowSleep=true;
    body.sleepSpeedLimit=.6   // 限制设的大一点，防止抖动
    world.addBody(body);
    bodies.push(body);
    body.position.set(px,py,pz);
    //render
    var cubeGeo = new THREE.BoxGeometry( sx,sy,sz, 10, 10 );
    var cubeMaterial = new THREE.MeshPhongMaterial( { color: 0x888888 } );
    var cubeMesh = new THREE.Mesh(cubeGeo, cubeMaterial);
    cubeMesh.castShadow = true;
    meshes.push(cubeMesh);
    scene.add(cubeMesh);

    return body;
}

function addSphere(r:number, px:number,py:number,pz:number){
    //phy
    var body = new Body({mass:0.5});
    var sphShape = new Sphere(r);
    body.addShape(sphShape);
    body.allowSleep=true;
    body.sleepSpeedLimit=.6   
    world.addBody(body);
    bodies.push(body);
    body.position.set(px,py,pz);
    //render
    var phGeo = new THREE.SphereGeometry(r,32,32);
    var phMaterial = new THREE.MeshPhongMaterial( { color: 0x888888 } );
    var phMesh = new THREE.Mesh(phGeo, phMaterial);
    phMesh.castShadow = true;
    meshes.push(phMesh);
    scene.add(phMesh);

    return body;
}

function addStack(x:number,y:number,z:number){
    let d=0.21;
    addBox(0.2,0.2,0.2,x,y,z);
    y+=d;
    addBox(0.2,0.2,0.2,x,y,z);
    y+=d;
    addBox(0.2,0.2,0.2,x,y,z);
    y+=d;
    addBox(0.2,0.2,0.2,x,y,z);
    y+=d;
    addBox(0.2,0.2,0.2,x,y,z);
    y+=d;
    addBox(0.2,0.2,0.2,x,y,z);    y+=d;
    addBox(0.2,0.2,0.2,x,y,z);
    y+=d;
    //addBox(0.2,0.2,0.2,x,y,z);
    addSphere(1,x,y,z);
}

function initCannon(){
    // Setup our world
    world = new World();
    world.quatNormalizeSkip = 0;
    world.quatNormalizeFast = false;

    world.gravity.set(0,-10,0);
    world.broadphase = new NaiveBroadphase();
    world.allowSleep=true;
    world.stepnumber=1;
    //world.gravity = new Vec3(0,0.1,0);

    // Create boxes
    /*
    var mass = 5, radius = 1.3;
    var boxShape = new Box(new Vec3(0.5,0.5,0.5));
    for(var i=0; i<N; i++){
        var boxBody = new Body({ mass: mass });
        boxBody.addShape(boxShape);
        boxBody.position.set(0,5,0);
        world.addBody(boxBody);
        bodies.push(boxBody);
    }

    var cubeGeo = new THREE.BoxGeometry( 1, 1, 1, 10, 10 );
    var cubeMaterial = new THREE.MeshPhongMaterial( { color: 0x888888 } );
    for(var i=0; i<N; i++){
        var cubeMesh = new THREE.Mesh(cubeGeo, cubeMaterial);
        cubeMesh.castShadow = true;
        meshes.push(cubeMesh);
        scene.add(cubeMesh);
    }
    */    

    // Create a plane
    var groundShape = new Plane();
    var groundBody = new Body({ mass: 0 });
    groundBody.addShape(groundShape);
    groundBody.quaternion.setFromAxisAngle(new Vec3(1,0,0),-Math.PI/2);
    world.addBody(groundBody);

    // Joint body
    var shape = new Sphere(0.1);
    jointBody = new Body({ mass: 0 });
    jointBody.addShape(shape);
    jointBody.collisionFilterGroup = 0;
    jointBody.collisionFilterMask = 0;
    world.addBody(jointBody);

}

function addMouseConstraint(x:number,y:number,z:number,body:Body) {
    // The cannon body constrained by the mouse joint
    constrainedBody = body;

    // Vector to the clicked point, relative to the body
    var v1 = new Vec3(x,y,z).vsub(constrainedBody.position);

    // Apply anti-quaternion to vector to tranform it into the local body coordinate system
    var antiRot = constrainedBody.quaternion.inverse();
    var pivot = antiRot.vmult(v1); // pivot is not in local body coordinates

    // Move the cannon click marker particle to the click position
    jointBody.position.set(x,y,z);

    // Create a new constraint
    // The pivot for the jointBody is zero
    mouseConstraint = new PointToPointConstraint(constrainedBody, pivot, jointBody, new Vec3(0,0,0));

    // Add the constriant to world
    world.addConstraint(mouseConstraint);
}

// This functions moves the transparent joint body to a new postion in space
function moveJointToPoint(x:number,y:number,z:number) {
    // Move the joint body to a new position
    jointBody.position.set(x,y,z);
    mouseConstraint.update();
}

function removeJointConstraint(){
    // Remove constriant from world
    world.removeConstraint(mouseConstraint);
    mouseConstraint = null;
}
