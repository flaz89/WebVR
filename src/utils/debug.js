import { debug } from "three/tsl";
import { gamesEvent } from "./eventEmitter";    

export class Debug {
    constructor() {
        this.addFPSDebug();
        gamesEvent.on('fpsUpdate', (fps) => {
            this.updateFPS(fps)}
        );

    }

     /* 
    FPS DEBUG FUNCTION -----------------------------------------
    */
    addFPSDebug() {
        const debugFPSElement = document.createElement('h3');
        
        // class and inline styòe
        debugFPSElement.className = 'debug';
        debugFPSElement.style.color = 'aqua';
        debugFPSElement.style.position = 'absolute';
        debugFPSElement.style.zIndex = '1';
        debugFPSElement.style.fontFamily = 'Arial, Helvetica, sans-serif';
        debugFPSElement.textContent = `FPS ${0}`;
        
        document.body.appendChild(debugFPSElement);
    }

    updateFPS(fps) {
        const debugFPSElement = document.querySelector('.debug');
        if(debugFPSElement) debugFPSElement.textContent = `FPS ${fps}`;
    }

     /* 
    FPS DEBUG FUNCTION -----------------------------------------
    */
}