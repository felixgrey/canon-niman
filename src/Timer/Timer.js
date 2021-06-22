class Oscillator {
  willAdd = [];
  willDelete = [];
  pulseHandleSet = new Set();

  emitPulse() {
    // const now = Date.now();
    // const difference = this.lastTime ? now - this.lastTime : 0;
    // this.lastTime = now;

    const {
      pulseHandleSet,
      willAdd,
      willDelete,
    } = this;

    for (let callback of pulseHandleSet) {
      callback(20);
    }

    for (let callback of willDelete) {
      pulseHandleSet.delete(callback);
    }
    this.willDelete = [];

    for (let callback of willAdd) {
      pulseHandleSet.add(callback);
    }
    this.willAdd = [];
  }

  addPulseHandle(callback) {
    this.willAdd.push(callback);
  }

  removePulseHandle(callback) {
    this.willDelete.push(callback);
  }
}

const commonOscillator = new Oscillator();

function emitPulse() {
  setTimeout(() => {
    commonOscillator.emitPulse();
    emitPulse();
  }, 20);
}
emitPulse();


class Timer {
  constructor(opt = {}) {
    const {
      pulseHandle = Function.prototype,
        interval = 20,
        oscillator = commonOscillator,
    } = opt;

    this.oscillator = oscillator;
    this.interval = interval;
    this.pulseHandle = (difference) => {
      this.stackTime += difference;
      if (this.stackTime >= this.interval) {
        this.stackTime = 0;
        pulseHandle();
      }
    };
  }

  running = false;

  setInterval(interval = this.interval) {
    this.interval = interval;
    this.stackTime = 0;
    return this;
  }

  run() {
    this.stackTime = 0;
    this.running = true;
    this.oscillator.addPulseHandle(this.pulseHandle);
    return this;
  }

  isRunning() {
    return this.running;
  }

  stop() {
    this.running = false;
    this.oscillator.removePulseHandle(this.pulseHandle);
    return this;
  }
}

export default Timer;
