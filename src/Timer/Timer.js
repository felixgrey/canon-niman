class Oscillator {
  willAdd = [];
  willDelete = [];
  pulseHandleSet = new Set();

  constructor() {
    this.doWhile();
  }

  doWhile() {
    const emitPulse = () => {
      setTimeout(() => {
        this.emitPulse();
        emitPulse();
      }, 20);
    }
    emitPulse();
  }

  getDifference() {
    // const now = Date.now();
    // const difference = this.lastTime ? now - this.lastTime : 0;
    // this.lastTime = now;
    // return difference;

    return 20;
  }

  emitPulse() {
    const difference = this.getDifference();

    const {
      pulseHandleSet,
      willAdd,
      willDelete,
    } = this;

    for (let callback of pulseHandleSet) {
      callback(difference);
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

class Timer {
  constructor(opt = {}) {
    const {
      pulseHandle = Function.prototype,
        interval = 20,
        oscillator = commonOscillator,
    } = opt;

    this.oscillator = oscillator;

    this.initInterval(interval);
    this.initStackTime();
    this.initPulseHandle(pulseHandle);

    this.pulseHandle = (difference) => {
      if (!this.running) {
        return;
      }

      this.intervalNames.forEach(name => {
        const stackTime = (this.stackTimeMap[name] += difference);
        const interval = this.intervalMap[name];
        const pulseHandle = this.pulseHandleMap[name];
        if (stackTime >= interval && pulseHandle) {
          this.stackTimeMap[name] = 0;
          pulseHandle(name, stackTime);
          this.pulseHandleMap.$$default(name, stackTime);
        }
      });
    };
  }

  initInterval(interval = this.interval) {
    if (typeof interval === 'number') {
      interval = {
        $$NoName: interval,
      };
    }
    this.intervalMap = interval;
    this.intervalNames = Object.keys(this.intervalMap);
  }

  initStackTime() {
    this.stackTimeMap = this.intervalNames.reduce((map, key) => {
      map[key] = 0;
      return map;
    }, {});
  }

  initPulseHandle(pulseHandle) {
    if (typeof pulseHandle === 'function') {
      pulseHandle = {
        $$NoName: pulseHandle,
        $$default: pulseHandle,
      };
    }
    this.pulseHandleMap = {
      $$default: Function.prototype,
      ...pulseHandle
    };
  }

  interval = 20;
  intervalNames = [];
  running = false;
  pulseHandleMap = {};

  setInterval(interval = this.interval) {
    this.initInterval(interval);
    this.initStackTime();
    return this;
  }

  run() {
    if (this.running) {
      return this;
    }
    this.initStackTime();
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
