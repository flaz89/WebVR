import * as THREE from 'three';
import { Timer } from 'three/src/core/Timer.js';
import {OrbitControls} from 'three/addons/controls/OrbitControls.js'
import {VRButton} from 'three/addons/webxr/VRButton.js';


const canvas = document.getElementById('canvas');

const sizes = {
    width: window.innerWidth,
    height: window.innerHeight
}

/* 
SCENE ----------------------------------------------
*/
const scene = new THREE.Scene();
/* 

GEOMETRY ----------------------------------------------
*/
const cube = new THREE.Mesh(
    new THREE.BoxGeometry(.5, .5, .5),
    new THREE.MeshBasicMaterial({color: 0xff0000})
);
cube.position.y = .5;

const floor = new THREE.Mesh(
    new THREE.CircleGeometry(2, 64),
    new THREE.MeshBasicMaterial({color: 0xffffff, side: THREE.DoubleSide})
);
floor.rotation.x = - Math.PI * 0.5;

scene.add(cube, floor);

/* 
CAMERA ----------------------------------------------
*/
const camera = new THREE.PerspectiveCamera(75, sizes.width / sizes.height);
camera.position.set(.5, 1, 3);
scene.add(camera);

/*
RENDERER ----------------------------------------------
*/
const renderer = new THREE.WebGLRenderer({
    canvas: canvas
});
renderer.setSize(sizes.width, sizes.height);
renderer.xr.enabled = true;
document.body.appendChild(VRButton.createButton(renderer));

/* 
CONTROLS ----------------------------------------------
*/
const orbitControls = new OrbitControls(camera, canvas);
orbitControls.enableDamping = true;
/* 

/* 
RESIZE ----------------------------------------------
*/
window.addEventListener('resize', ()=> {
  
    sizes.width = window.innerWidth;   //update sizes
    sizes.height = window.innerHeight;         //
    camera.aspect = sizes.width / sizes.height;     //update camera
    camera.updateProjectionMatrix();                       //
    renderer.setSize(sizes.width, sizes.height); //update renderer
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
})


/*
TICK ----------------------------------------------
*/
const timer = new Timer();
const tick = () => {
    timer.update();
    const elapsedTime = timer.getElapsed() * 0.3;

    // Update objects
    cube.rotation.y = elapsedTime;
    cube.rotation.x = elapsedTime;

    // Update controls
    orbitControls.update();

    // Render
    renderer.render(scene, camera);

    // Call tick again on the next frame
    renderer.setAnimationLoop(tick);
    
}
tick(); 

