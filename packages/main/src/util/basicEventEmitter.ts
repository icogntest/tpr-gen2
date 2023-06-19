import EventEmitter from 'node:events';

const eventName = 'junkName';

type Listener<T> = (value: T | undefined) => void;

class BasicEventEmitter<T> {
  private emitter = new EventEmitter();
  private alreadyEmitted = false;
  private currentValue: T | undefined;

  // Subscribe 'once' or if the event was already emitted, get the current
  // value.
  onceOrPrev(listener: Listener<T>) {
    if (this.alreadyEmitted) {
      listener(this.currentValue);
    } else {
      this.emitter.once(eventName, listener);
    }
  }

  // Update the current value. If this is the first time the value is being
  // updated, also emit event to all listeners.
  update(arg: T) {
    this.currentValue = arg;
    if (this.alreadyEmitted) {
      return;
    }
    this.alreadyEmitted = true;
    this.emitter.emit(eventName, arg);
  }
}

function basicEventEmitter<T>() {
  return new BasicEventEmitter<T>();
}

export default basicEventEmitter;
