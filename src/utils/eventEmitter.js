class EventEmitter {
    constructor() {
        this.listeners = {};
    }

    // called from object which is listening to an event
    on(event, callback) {
        if (!this.listeners[event]) {
            this.listeners[event] = [];
        }
        this.listeners[event].push(callback);
    }

    // called from object which emits an event
    emit(event, ...args) {
        if (this.listeners[event]) {
            this.listeners[event].forEach(callback => {
                callback(...args);
            });
        }
    }
}

export const gamesEvent = new EventEmitter();