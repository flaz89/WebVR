import { DeviceDetector } from './utils/deviceDetector';
import { Debug } from './utils/debug';
import { SceneManager } from './experience/sceneManager';
//import { PlayerControls } from './experience/playerControls';
//import { EventEmitter } from './utils/eventEmitter';


class App {
    constructor() {
        this.deviceDetector = null;
        this.debug = null;
        this.eventEmitter = null;
        this.sceneManager = null;
        //this.playerControls = null;

        this.isInitialized = false;
        this.isRunning = false;

        this.onResize = this.onResize.bind(this);
        this.onVisibilityChange = this.onVisibilityChange.bind(this);
    }

    /* 
    APP INIT FUNCTION -----------------------------------------
    */
    async init() {
        try {
            console.log('📋 init() Starting initialization sequence...');
            await this.initEventSystem();
            await this.initDebug();
            await this.initDeviceDetection();
            await this.initScene();
            

            this.setupGlobalEvents();
            
        } catch (error) {
            console.error('❌ Failed to initialize App:', error);
            this.handleError(error);
        }
    }

    /* 
    INIT EVENT SYSTEM -----------------------------------------
    initialize the global event system for the app
    */
    async initEventSystem() {
        this.eventEmitter = {
            emit: (event, data) => console.log(`Event: ${event}`, data),
            on: (event, callback) => console.log(`Listening to: ${event}`),
            off: (event, callback) => console.log(`Stop listening to: ${event}`)
        };
        console.log('✅ Event System ready');
    }

    /* 
    INIT DEBUG SYSTEM -----------------------------------------
    */
    async initDebug() {
        this.debug = new Debug();
        this.debug.init();
        this.debug.setupKeyboardShortcut();
        console.log('✅ Debug System ready');
    }

    /* 
    INIT DEVICE DETECTION -----------------------------------------
    */
    async initDeviceDetection() {
        console.log('📱 Detecting device...');

        this.deviceDetector = new DeviceDetector();
        const deviceInfo = await this.deviceDetector.detect();
        this.debug.addDeviceInfo(this.deviceDetector);
        this.eventEmitter.emit('device-detected', deviceInfo);

        console.log('✅ Device Detection completed');
    }

    /* 
    INIT SCENE MANAGER -----------------------------------------
    */
    async initScene() {
        const canvas = this.createCanvas();
        this.sceneManager = new SceneManager(this.deviceDetector.deviceInfo, canvas);
        this.eventEmitter.emit('scene-ready');
        
        console.log('✅ 3D Scene ready');
    }

    /*
    INIT PLAYER CONTROLS ----------------------------------------
    */
    async initControls() {
        console.log('✅ Controls ready');
    }

    /* 
    SETUP BROWSER GLOBAL EVENTS ----------------------------------------
        such as resize, visibility change, before unload
    */
    setupGlobalEvents() {
        window.addEventListener('resize', this.onResize);
        document.addEventListener('visibilitychange', this.onVisibilityChange);
        window.addEventListener('beforeunload', () => { this.dispose();});
        console.log('✅ Global events set up');
    }

    /* 
    START THE APP ----------------------------------------
    */
    start() {
        this.isRunning = true;
        this.eventEmitter.emit('appStarted');
        console.log('✅ WebVR App is running!');
    }

    /* 
    RESIZE EVENT HANDLER ----------------------------------------
    */
    onResize() {

    }

    /* 
    HANDLE APP STATE ----------------------------------------
    such as pausing when the tab is not visible or resuming when it is visible again
    */
    onVisibilityChange() {
        if (document.hidden) {
            this.pause();
        } else {
            this.resume();
        }
    }

    pause() {
        this.isRunning = false;
        this.eventEmitter.emit('appPaused');
    }

    resume() {
        this.isRunning = true;
        this.eventEmitter.emit('app-resumed');
    }

    /* 
    HANDLE ERRORS ----------------------------------------
    */
    handleError(error) {
        console.error('💥 Application Error:', error);
        this.eventEmitter.emit('appError', error);
    }

    /* 
    CREATE CANVAS ELEMENT ----------------------------------------
    */
    createCanvas() {
        const canvas = document.createElement('canvas');
        canvas.id = 'canvas';
        canvas.style.position = 'fixed';
        canvas.style.top = '0';
        canvas.style.left = '0';
        canvas.style.width = '100%';
        canvas.style.height = '100%';
        canvas.style.zIndex = '1';
        
        document.body.appendChild(canvas);
        return canvas;
    }

    /* 
    DISPOSE THE APP ----------------------------------------
    */
   dispose() {
        window.removeEventListener('resize', this.onResize);
        document.removeEventListener('visibilitychange', this.onVisibilityChange);

        this.isRunning = false;
        this.isInitialized = false;
        console.log('✅ WebVR App disposed');
   }
}

/* 
DOM CONTENT LOADED EVENT LISTENER -----------------------------------------
called when the HTML is fully loaded (before images and other resources), created global app instance and call init()
*/
document.addEventListener('DOMContentLoaded', async () => {
    console.log('🌟 DOM loaded, starting App...');
    window.app = new App();
    await window.app.init();
});

// Global error handling
window.addEventListener('error', (event) => {
    console.error('💥 Uncaught Error:', event.error);
    if (window.app) {
        window.app.handleError(event.error);
    }
});

// Global unhandled promise rejection handling
window.addEventListener('unhandledrejection', (event) => {
    console.error('💥 Unhandled Promise Rejection:', event.reason);
    if (window.webvrApp) {
        window.webvrApp.handleError(event.reason);
    }
});




