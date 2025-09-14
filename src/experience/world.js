import * as THREE from 'three';
import { Timer } from 'three/src/core/Timer.js';
import {OrbitControls} from 'three/addons/controls/OrbitControls.js'
import {VRButton} from 'three/addons/webxr/VRButton.js';


export class World {
    constructor() {
        this.initScene();
        this.animateScene();
    }

    /* 
    function called from cuonstructor to setup and generate all the 3D scene
    */
    initScene() {
        const canvas = document.getElementById('canvas');
        this.sizes = {
            width: window.innerWidth,
            height: window.innerHeight
        }

        // SCENE ----------------------------------------------
        this.scene = new THREE.Scene();

        // GEOMETRY ----------------------------------------------
        this.cube = new THREE.Mesh(
            new THREE.BoxGeometry(.5, .5, .5),
            new THREE.MeshBasicMaterial({color: 0xff0000})
        );
        this.cube.position.y = .5;

        this.floor = new THREE.Mesh(
            new THREE.CircleGeometry(2, 64),
            new THREE.MeshBasicMaterial({color: 0xffffff, side: THREE.DoubleSide})
        );
        this.floor.rotation.x = - Math.PI * 0.5;
        this.scene.add(this.cube, this.floor);

        // CAMERA ----------------------------------------------
        this.camera = new THREE.PerspectiveCamera(75, this.sizes.width / this.sizes.height);
        this.camera.position.set(.5, 1, 3);
        this.scene.add(this.camera);

        
        // RENDERER ----------------------------------------------
        this.renderer = new THREE.WebGLRenderer({ canvas: canvas});
        this.renderer.setSize(this.sizes.width, this.sizes.height);
        this.renderer.xr.enabled = true;
        document.body.appendChild(VRButton.createButton(this.renderer));

        // CONTROLS ----------------------------------------------
        this.orbitControls = new OrbitControls(this.camera, canvas);
        this.orbitControls.enableDamping = true;

        // RESIZE ----------------------------------------------
        window.addEventListener('resize', this.onResize.bind(this));

        // DEBUG ----------------------------------------------
        this.addDebug();
    }

    /* 
    function onRezize called when the window is resized from initScene()
    */
    onResize() {
        this.sizes.width = window.innerWidth;
        this.sizes.height = window.innerHeight;

        this.camera.aspect = this.sizes.width / this.sizes.height; //update camera
        this.camera.updateProjectionMatrix();                  //
        this.renderer.setSize(this.sizes.width, this.sizes.height); //update renderer
        this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    }

    /* 
    tick function called from constructor to update and render the scene each fream
    */
    animateScene() {
        this.timer = new Timer();
        this.fps = 0;
 

        const tick = () => {
            this.fps;
            this.timer.update();
            this.fps = ((1/ this.timer.getDelta())).toFixed(1);
            const elapsedTime = this.timer.getElapsed();
            
            // Update objects
            this.cube.rotation.y = elapsedTime;
            this.cube.rotation.x = elapsedTime;

            // Update controls
            this.orbitControls.update();

            // Update debug
            const currentSecond = Number(elapsedTime.toFixed(0));
            if (this.lastSecond !== currentSecond) {
                this.lastSecond = currentSecond;
                document.querySelector('.debug').textContent = `FPS ${this.fps}`;
            }

            // Render
            this.renderer.render(this.scene, this.camera);

            // Call tick again on the next frame
            this.renderer.setAnimationLoop(tick);
            
        }
        tick();
    }


    /* 
    DEBUG FUNCTION CALLED INIT SCENE
    */
    addDebug() {
        // Crea l'elemento h3
        const debugElement = document.createElement('h3');
        
        // Imposta la classe
        debugElement.className = 'debug';
        
        // Imposta lo style inline
        debugElement.style.color = 'aqua';
        debugElement.style.position = 'absolute';
        debugElement.style.zIndex = '1';
        
        // Imposta il testo
        debugElement.textContent = `FPS ${this.fps}`;
        
        // Aggiunge l'elemento al body (o a un altro contenitore specifico)
        document.body.appendChild(debugElement);
    }
}


