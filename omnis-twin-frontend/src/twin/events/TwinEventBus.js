/**
 * Decoupled Twin Event Bus
 * Dispatches twin events: COMPONENT_SELECTED, COMPONENT_FOCUSED, COMPONENT_ISOLATED, SYSTEM_SELECTED, DIAGNOSTIC_UPDATED
 */
class TwinEventBus {
  constructor() {
    this.listeners = new Map();
  }

  on(eventType, callback) {
    if (!this.listeners.has(eventType)) {
      this.listeners.set(eventType, new Set());
    }
    this.listeners.get(eventType).add(callback);
    return () => this.off(eventType, callback);
  }

  off(eventType, callback) {
    if (this.listeners.has(eventType)) {
      this.listeners.get(eventType).delete(callback);
    }
  }

  emit(eventType, payload) {
    if (this.listeners.has(eventType)) {
      this.listeners.get(eventType).forEach((cb) => {
        try {
          cb(payload);
        } catch (e) {
          console.error(`Error in event listener for ${eventType}:`, e);
        }
      });
    }
  }
}

export const twinEventBus = new TwinEventBus();
