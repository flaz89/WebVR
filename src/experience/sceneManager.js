import * as THREE from 'three';
import { Timer } from 'three/src/core/Timer.js';
import {OrbitControls} from 'three/addons/controls/OrbitControls.js'
import {VRButton} from 'three/addons/webxr/VRButton.js';

export class SceneManager {
    constructor(deviceInfo, canvas, debug = null) {
        console.log('🎬 SceneManager - Initializing with device:', deviceInfo.type);
        this.deviceInfo = deviceInfo;
        this.canvas = canvas;
        this.debug = debug;
        this.initScene();
        this.animateScene();
    }

    /*
    OPTIMIZING SCENE ON SPECIFIC DEVICE ------------------------------ 
    used to define which initial setup supply based on client hardware, called at first in initScene()
     */
    applyDeviceOptimizations() {
        console.log(`⚙️ Applying optimizations for: ${this.deviceInfo.type} (${this.deviceInfo.performance})`);

        //default settings
        this.settings = {
            pixelRatio: 1,
            shadows: false,
            antialias: false,
            shadowMapSize: 1024,
            maxLights: 2
        };

        switch(this.deviceInfo.performance) {
            case 'high':
                this.settings.pixelRatio = Math.min(window.devicePixelRatio, 2);
                this.settings.shadows = true;
                this.settings.antialias = true;
                this.settings.shadowMapSize = 2048;
                this.settings.maxLights = 4;
                console.log('🚀 High performance settings applied');
                break;
            
            case 'medium':
                this.settings.pixelRatio = Math.min(window.devicePixelRatio, 1.5);
                this.settings.shadows = this.deviceInfo.type === 'desktop'; // Shadows only on desktop
                this.settings.antialias = this.deviceInfo.type === 'desktop';
                this.settings.shadowMapSize = 1024;
                this.settings.maxLights = 2;
                console.log('⚡ Medium performance settings applied');
                break;
            
            case 'low':
            default:
                this.settings.pixelRatio = 1;
                this.settings.shadows = false;
                this.settings.antialias = false;
                this.settings.shadowMapSize = 512;
                this.settings.maxLights = 1;
                console.log('🔋 Low performance settings applied');
                break;
        }

        if (this.deviceInfo.type === 'vr-headset') {
            this.settings.pixelRatio = 1; // Always 1 for VR performance
            this.settings.antialias = false; // Disable for better VR performance
            console.log('🥽 VR optimizations applied');
        }
    }

    /* 
    COLLECT RENDERER DATA ----------------------------------------------------
    called in tick() to collect data each second
    */
    collectPerformanceData() {

        const performanceData = {
            fps: this.fps || '0',
            triangles: '0',
            drawCalls: '0', 
            geometries: '0',
            textures: '0',
            memoryUsed: '0 MB'
        };

        if (this.renderer && this.renderer.info) {
            const info = this.renderer.info;
            performanceData.triangles = info.render.triangles.toLocaleString();
            performanceData.drawCalls = info.render.calls.toString();
            performanceData.geometries = info.memory.geometries.toString();
            performanceData.textures = info.memory.textures.toString();
            
            this.renderer.info.reset(); //reset renderer each frame
        }

        if ('memory' in performance && performance.memory) {
            const memoryMB = Math.round(performance.memory.usedJSHeapSize / 1024 / 1024);
            performanceData.memoryUsed = `${memoryMB} MB`;
        }

        return performanceData;
    }

    /* 
    TOGGLE SHADOWS ------------------------------------------------------------------------------------------- 
    allows debug to manage shadows, called from debug.js in function addSCeneControls()
    */
    toggleShadows(enabled) {

        this.renderer.shadowMap.enabled = enabled;
        this.directionalLight.castShadow = enabled;
        this.cube.castShadow = enabled;
        this.floor.receiveShadow = enabled;
        
        this.settings.shadows = enabled;
    }

    /* 
    TOGGLE ANTIALIAS -------------------------------------------------------------------------------------------
    allows debug to manage antialiasing, called from debug.js in function addSCeneControls()
    */
    toggleAntialias(enabled) {
    console.log(`✨ Antialias toggle: ${enabled} (Note: requires page reload for full effect)`);
    this.settings.antialias = enabled;
    // Note: Per il vero antialias serve ricreare il renderer, ma è troppo pesante
    }

    /* 
    TOGGLE ANTIALIAS -------------------------------------------------------------------------------------------
    allows debug to manage antialiasing, called from debug.js in function addSCeneControls()
    */
    toggleWireframe(enabled) {
        this.cube.material.wireframe = enabled;
        this.floor.material.wireframe = enabled;
    }

    /* 
    SET BACKGROUND COLOR -------------------------------------------------------------------------------------------
    allows debug to manage scene background color, called from debug.js in function addSCeneControls()
    */
    setBackgroundColor(color) {
        console.log('CI SONOOOOOOOOO');
        
        this.scene.background.set(color);
    }

    /* 
    TOGGLE HELPERS -------------------------------------------------------------------------------------------
    called from debug.js in function addSCeneControls()
    */
    toggleAxes(visible) {
        this.axesHelpers.visible = visible;
    }

    toggleLightHelpers(visible) {
        this.directionalLightHelper.visible = visible;
    }

    toggleCameraHelper(visible) {
        this.directionalLightCameraHelper.visible = visible;
    }

    setAmbientIntensity(intensity) {
        this.ambientLight.intensity = intensity;
    }

    setDirectionalIntensity(intensity) {
        this.directionalLight.intensity = intensity;
    }

    setDirectionalPosition(x, y, z) {
        this.directionalLight.position.set(x, y, z);
    }

    

    /* 
    function called from constructor to setup and generate all the 3D scene ---------------------------------------------
    */
    initScene() {
        this.applyDeviceOptimizations();

        const canvas = this.canvas;
        this.sizes = {
            width: window.innerWidth,
            height: window.innerHeight
        }

        // SCENE ----------------------------------------------
        this.scene = new THREE.Scene();
        this.scene.background = new THREE.Color(0x000011);
        this.axesHelpers = new THREE.AxesHelper(2);
        this.axesHelpers.visible = false;
        this.scene.add(this.axesHelpers);

        // LIGHTS ----------------------------------------------
        this.ambientLight = new THREE.AmbientLight(0xffffff, 0.5);

        this.directionalLight = new THREE.DirectionalLight(0xffffff, 1.5);
        this.directionalLight.position.set(2, 2, 1);
        this.directionalLight.castShadow = this.settings.shadows;
        this.directionalLight.shadow.mapSize.x = this.settings.shadowMapSize;
        this.directionalLight.shadow.mapSize.y = this.settings.shadowMapSize;
        this.directionalLight.shadow.camera.top = 2;
        this.directionalLight.shadow.camera.right = 2;
        this.directionalLight.shadow.camera.left = -2;
        this.directionalLight.shadow.camera.bottom = -2;
        this.directionalLight.shadow.camera.near = 1;
        this.directionalLight.shadow.camera.far = 20;

        this.scene.add(this.ambientLight, this.directionalLight);
        //helpers
        this.directionalLightHelper = new THREE.DirectionalLightHelper( this.directionalLight, 2 );
        this.directionalLightCameraHelper = new THREE.CameraHelper( this.directionalLight.shadow.camera );
        this.directionalLightHelper.visible = false;
        this.directionalLightCameraHelper.visible = false;
        this.scene.add( this.directionalLightHelper, this.directionalLightCameraHelper );

        // GEOMETRY ----------------------------------------------
        this.cube = new THREE.Mesh(
            new THREE.BoxGeometry(.5, .5, .5),
            new THREE.MeshStandardMaterial({color: 0xff0000})
        );
        this.cube.castShadow = this.settings.shadows;
        this.cube.position.y = .5;

        this.floor = new THREE.Mesh(
            new THREE.CircleGeometry(2, 64),
            new THREE.MeshStandardMaterial({color: 0xffffff, side: THREE.DoubleSide})
        );
        this.floor.receiveShadow = this.settings.shadows;
        this.floor.rotation.x = - Math.PI * 0.5;
        this.scene.add(this.cube, this.floor);

        // CAMERA ----------------------------------------------
        this.camera = new THREE.PerspectiveCamera(75, this.sizes.width / this.sizes.height);
        this.camera.position.set(5, 4, 5); //.5, 1, 3
        this.scene.add(this.camera);

        
        // RENDERER ----------------------------------------------
        this.renderer = new THREE.WebGLRenderer({ canvas: canvas, antialias: this.settings.antialias });
        this.renderer.setSize(this.sizes.width, this.sizes.height);
        this.renderer.setPixelRatio(this.settings.pixelRatio);
        this.renderer.shadowMap.enabled = this.settings.shadows;
        if (this.settings.shadows) this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;
        this.renderer.xr.enabled = true;
        document.body.appendChild(VRButton.createButton(this.renderer));

        // CONTROLS ----------------------------------------------
        this.orbitControls = new OrbitControls(this.camera, canvas);
        this.orbitControls.enableDamping = true;

        // RESIZE ----------------------------------------------
        window.addEventListener('resize', this.onResize.bind(this));
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
        this.fps;
 
        const tick = () => {
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
                //gamesEvent.emit('fpsUpdate', this.fps);
                if (this.debug) {
                    const performanceData = this.collectPerformanceData();
                    this.debug.updatePerformanceData(performanceData);
                }
                //console.log(`🎮 FPS: ${this.fps}`);
            }

            // Render
            this.renderer.render(this.scene, this.camera);

            // Call tick again on the next frame
            this.renderer.setAnimationLoop(tick);
            
        }
        tick(); 
    }
}


