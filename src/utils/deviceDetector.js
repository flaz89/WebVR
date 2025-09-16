export class DeviceDetector {
    constructor() {
        console.log('📱 DeviceDetector: Detecting device...');
        this.deviceInfo = null;
    }

    /* 
    DEVICE DETECTION -----------------------------------------
    update and return object with device info called from initDeviceDetection() in main.js
    */
    async detect() {

        this.deviceInfo = {
            type: 'unknown',
            hasVR: false,
            hasAR: false,
            webXRSupport: ('xr' in navigator) ? 'Available' : 'Not Available',
            isTouchDevice: false,
            screenSize: this.getScreenSize(),
            screenWidth: window.innerWidth,
            screenHeight: window.innerHeight,
            pixelRatio: window.devicePixelRatio || 1,
            userAgent: navigator.userAgent,
            performance: 'unknown'
        };

        // check VR / AR
        if ('xr' in navigator) {
            try {
                this.deviceInfo.hasVR = await navigator.xr.isSessionSupported('immersive-vr');
                this.deviceInfo.hasAR = await navigator.xr.isSessionSupported('immersive-ar');
            } catch (e) {
                console.warn('WebXR detection failed:', e);
            }
        }

        // check if device has touch control
        this.deviceInfo.isTouchDevice = 'ontouchstart' in window || navigator.maxTouchPoints > 0;
        this.deviceInfo.type = this.classifyDevice(this.deviceInfo);
        this.detectPerformance();
        
        return this.deviceInfo;
    }

    /* 
    CLASSIFY DEVICE FROM USER AGENT -----------------------------------------
    simple user agent analysis to classify device type
    */
    classifyDevice(info) {
        const ua = navigator.userAgent.toLowerCase();

        console.log('🕵️ Analyzing User Agent:', ua);

        // VR Headsets
        if (ua.includes('oculusbrowser') || ua.includes('quest')) {
            return 'meta-quest';
        }
        if (ua.includes('pico')) {
            return 'pico-vr';
        }
        if (ua.includes('vive') || ua.includes('steamvr')) {
            return 'steamvr-vr';
        }
        if (ua.includes('visionos')) {
            return 'apple-vision-pro';
        }

        // PC with VR capability
        if (info.hasVR && info.screenSize === 'large' && !info.isTouchDevice) {
            return 'pc-vr';
        }

        // Mobile devices
        if (info.isTouchDevice && info.screenSize === 'small') {
            return 'mobile';
        }
        if (info.isTouchDevice && info.screenSize === 'medium') {
            return 'tablet';
        }

        // Default to desktop
        return 'desktop';
    }

    /* 
    OBTAIN DEVICE SCREEN SIZE ---------------------------------------
    */
    getScreenSize() {
        const width = window.innerWidth;
        if (width < 768) return 'small';   // Mobile
        if (width < 1024) return 'medium'; // Tablet
        return 'large';                    // Desktop
    }

    /* 
    MANAGER PERFORMANCE DETECTION ----------------------------------------------------------------------------------------------------------
    called in detect() from initDeviceDetection() in main.js
    */
    detectPerformance() {
        console.log('⚡ Detecting device performance...');
        this.deviceInfo.gpu = this.getGPUInfo();
        this.deviceInfo.memory = this.getMemoryInfo();
        this.deviceInfo.cores = this.getCPUCores();
        this.deviceInfo.performance = this.calculatePerformanceLevel();
    }

    getGPUInfo(){
        try {
            const canvas = document.createElement('canvas');
            const gl = canvas.getContext('webgl') || canvas.getContext('experimental-webgl');

            if (!gl) {
                return 'WebGL not supported';
            }

            const renderer = gl.getParameter(gl.RENDERER);
            return renderer || 'GPU info not available';
        
        } catch (error) {
            console.warn('GPU detection failed:', error);
            return 'GPU detection failed';
        }
    }

    getMemoryInfo() {
        try {
            if ('memory' in performance) {
               const memory = performance.memory; 
               const totalMB = Math.round(memory.jsHeapSizeLimit / 1024 / 1024);
               return `~${totalMB}MB available`;
            }

            if ('deviceMemory' in navigator) {
            return `${navigator.deviceMemory}GB`;
            }

            return 'Memory info not available';
        } catch (error) {
            console.warn('Memory detection failed:', error);
            return 'Memory detection failed';
        }
    }

    getCPUCores() {
        try {
            if ('hardwareConcurrency' in navigator) {
            return `${navigator.hardwareConcurrency} cores`;
            }
            return 'CPU info not available';

        } catch (error) {
            console.warn('CPU detection failed:', error);
            return 'CPU detection failed';
        }
    }

    calculatePerformanceLevel() {
        const gpu = this.deviceInfo.gpu.toLowerCase();
        const deviceType = this.deviceInfo.type;

        if (deviceType.includes('vr') || deviceType === 'vr-headset') {
            return 'high';
        }
        
        if (deviceType === 'mobile') {
            return 'low';
        }
        
        if (deviceType === 'tablet') {
            return 'medium';
        }
        
        if (deviceType === 'desktop') {
            if (gpu.includes('rtx') || gpu.includes('geforce gtx 1') || 
                gpu.includes('radeon rx') || gpu.includes('apple m')) {
                return 'high';
            }
            
            if (gpu.includes('intel') && gpu.includes('graphics')) {
                return 'medium';
            }
            
            return 'medium';
        }
        
        return 'unknown'; 
    }

    /* 
    HELPER METHODS -----------------------------------------
    simple helper methods to check device type
    */

    isVR() {
        return this.deviceInfo?.type === 'vr-headset';
    }

    isMobile() {
        return ['mobile', 'tablet'].includes(this.deviceInfo?.type);
    }

    isDesktop() {
        return this.deviceInfo?.type === 'desktop';
    }

    /* 
    TRANSFORM DEVICE TYPE TO EMOJI -----------------------------------------
    simple function to return an emoji based on device type
    */
    getDeviceEmoji() {
        const emojis = {
            'meta-quest': '🥽',
            'apple-vision-pro': '🥽',
            'pico-vr':  '🥽',
            'steamvr-vr': '🥽',
            'mobile': '📱',
            'tablet': '📱',
            'desktop': '💻'
        };
        return emojis[this.deviceInfo?.type] || '❓';
    }
    
}
