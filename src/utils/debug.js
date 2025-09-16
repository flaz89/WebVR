import { GUI } from 'lil-gui';
export class Debug {
    constructor() {
        this.gui = null;

        this.folders = {
            device: null,           
            performance: null,
        };

        this.components = {
            deviceDetector: null,
            sceneManager: null,
        };

        this.performanceData = {
            fps: '0',
            triangles: '0', 
            drawCalls: '0',
            geometries: '0',
            textures: '0',
            memoryUsed: '0 MB'
        };

        this.isVisible = true;
        console.log('✅ Debug - Initialization complete');
    }

    /* 
    INIT DEBUG UI ----------------------------------------
    */
    init() {
        this.gui = new GUI({ title:'App Debug',  width: 300, closeFolders: false });
        this.gui.domElement.style.position = 'fixed';
        this.gui.domElement.style.top = '10px';
        this.gui.domElement.style.right = '10px';

        this.addGeneralControls();
        this.setupDeviceFolder();
        this.setupPerformanceFolder();

        //this.gui.close();

        console.log('✅ Debug - GUI created and ready');
    }

    /* 
    ADD GENERAL CONTROLS ------------------------------
    as toggle visibility, fullscreen mode, reload page called from init()
    */
    addGeneralControls() {
        const generalControls = {
            visible: this.isVisible,
            toggleFullScreen: () => {
                if (!document.fullscreenElement) {
                    document.documentElement.requestFullscreen();
                } else {
                    document.exitFullscreen();
                }
            }
        }

        this.gui.add(generalControls, 'visible').name('Show Debug').onChange((value) => {
                this.isVisible = value;
                this.toggleVisibility(value);
            }
        );

        this.gui.add(generalControls, 'toggleFullScreen').name('Fullscreen');
            
    }

    /*
    DEVICE INFO DEBUG -----------------------------------------------------------------------
    */
    // create folder with placeholder
    setupDeviceFolder() {
        this.folders.device = this.gui.addFolder('Device Info');

        const placeHolder = {status: 'Waiting for device detection...' };
        this.folders.device.add(placeHolder, 'status').name('Status').disable();
    }

    // called from main.js in initDeviceDetection() to populate device data in ui
    addDeviceInfo(deviceDetector) {
        this.components.deviceDetector = deviceDetector;  
        
        if (!this.folders.device || !deviceDetector.deviceInfo) {
            console.warn('⚠️ Debug - Device folder or device info not ready');
            return;
        }

        this.folders.device.destroy();
        this.folders.device = this.gui.addFolder('Device Info');

        const deviceInfo = deviceDetector.deviceInfo;

        const deviceControls = {
            type: deviceInfo.type,
            emoji: deviceDetector.getDeviceEmoji(),
            userAgent: deviceInfo.userAgent,
            screenSize: deviceInfo.screenSize,
            isTouchDevice: deviceInfo.isTouchDevice,
            pixelRatio: deviceInfo.pixelRatio,
            hasVR: deviceInfo.hasVR,
            hasAR: deviceInfo.hasAR,
            webXRSupport: deviceInfo.webXRSupport,
            performance: deviceInfo.performance,
            gpu: deviceInfo.gpu,
            memory: deviceInfo.memory,
            cores: deviceInfo.cores,

            showFullUA: () => {
                console.log('🔍 Full User Agent:', deviceInfo.userAgent);
            }
        }

        this.folders.device.add(deviceControls, 'showFullUA').name('Log Full User Agent');
        this.folders.device.add(deviceControls, 'type').name('Device Type').disable();
        this.folders.device.add(deviceControls, 'emoji').name('Icon').disable();
        this.folders.device.add(deviceControls, 'userAgent').name('User Agent').disable();
        this.folders.device.add(deviceControls, 'screenSize').name('Screen Size').disable();
        this.folders.device.add(deviceControls, 'isTouchDevice').name('Touch Support').disable();
        this.folders.device.add(deviceControls, 'pixelRatio').name('Pixel Ratio').disable();
        this.folders.device.add(deviceControls, 'hasVR').name('VR Support').disable();
        this.folders.device.add(deviceControls, 'hasAR').name('AR Support').disable();
        this.folders.device.add(deviceControls, 'webXRSupport').name('WebXR API').disable();
        this.folders.device.add(deviceControls, 'performance').name('Performance Level').disable();
        this.folders.device.add(deviceControls, 'gpu').name('GPU').disable();
        this.folders.device.add(deviceControls, 'memory').name('Memory').disable();
        this.folders.device.add(deviceControls, 'cores').name('CPU Cores').disable();

        this.folders.device.close();
         console.log('✅ Debug - Device info displayed in panel');
    }

    /* 
    PERFORMANCE DEBUG -------------------------------------------------------------
    */
    // create folder with placeholder
    setupPerformanceFolder() {
        this.folders.performance = this.gui.addFolder('Performance');
        const placeholder = { status: 'Waiting for scene initialization...' };
        this.folders.performance.add(placeholder, 'status').name('Status').disable();
    }

    // called from main.js in initScene() to populate performance data in ui
    addPerformanceMonitoring(sceneManager) {
        console.log('⚡ Debug - Adding performance monitoring...');
        this.components.sceneManager = sceneManager;
        if (!this.folders.performance) {
            console.warn('⚠️ Debug - Performance folder not ready');
            return;
        }
        this.folders.performance.destroy();
        this.folders.performance = this.gui.addFolder('Performance');

        this.folders.performance.add(this.performanceData, 'fps').name('FPS').disable().listen();
        this.folders.performance.add(this.performanceData, 'triangles').name('Triangles').disable().listen();
        this.folders.performance.add(this.performanceData, 'geometries').name('Geometries').disable().listen();
        this.folders.performance.add(this.performanceData, 'textures').name('Textures').disable().listen();
        this.folders.performance.add(this.performanceData, 'drawCalls').name('Draw Calls').disable().listen();
        this.folders.performance.add(this.performanceData, 'memoryUsed').name('Memory Used').disable().listen();

        this.folders.performance.open();
    }

    // called from SceneManager to update performance data in debug
    updatePerformanceData(data) {
        this.performanceData.fps = data.fps || '0';
        this.performanceData.triangles = data.triangles || '0';
        this.performanceData.drawCalls = data.drawCalls || '0';  
        this.performanceData.geometries = data.geometries || '0';
        this.performanceData.textures = data.textures || '0';
        this.performanceData.memoryUsed = data.memoryUsed || '0 MB';
    }

    /* 
    TOGGLE DEBUG VISIBILITY ------------------------------------
    called from setupKeyboardShortcut() and from generalControls{}
    */
    toggleVisibility(visible) {
        if (this.gui) {
            this.gui.domElement.style.display = visible ? 'block' : 'none';
        }
    }
    
    /* 
    EVENT LISTENER ON 'H' KEY BUTTON ----------------------------
    clicking 'h' hide debug menu
    */
    setupKeyboardShortcut() {
        window.addEventListener('keydown', (event) => {
            if (event.key === 'h' || event.key === 'H') {
                this.isVisible = !this.isVisible;
                this.toggleVisibility(this.isVisible);
            }
        })
    }

    /* 
    
    */
    update() {}

    /* 
    
    */
    dispose() {
        if (this.gui) {
            this.gui.destroy();
            this.gui = null;
        }
    }
}