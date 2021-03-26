function isNvl(v) {
  return v === undefined || v === null;
}

function proxyAble(v) {
  if (isNvl(v)) {
    return false;
  }

  if (typeof v === 'object' || typeof v === 'function') {
    return true;
  }

  return false;
}

function isDiff(a, b) {
  if (Number.isNaN(a) || Number.isNaN(b)) {
    return !(Number.isNaN(a) && Number.isNaN(b));
  }

  return a !== b;
}

function isNotProxy(field) {
  return /^\$|^_/.test(field);
}

class Handle {
  constructor(methods = {}) {
    this.methods = methods;

    if (methods['$onSet']) {
      this.setterHandle = methods['$onSet'];
      Reflect.deleteProperty(methods, '$onSet');
    }

    if (methods['$onGet']) {
      this.getterHandle = methods['$onGet'];
      Reflect.deleteProperty(methods, '$onGet');
    }
  }

  getterHandle = Function.prototype;
  setterHandle = Function.prototype;
}

function createProxy(target, param = {}) {
  if (!proxyAble(target)) {
    return target;
  }

  const {
    path = [],
      handle = null,
  } = param;

  if (!handle) {
    handle = new Handle();
  }

  return new Proxy(target, {
    get: function(obj, field) {
      const value = Reflect.get(obj, field, obj);

      if (isNotProxy(field)) {
        if (typeof handle.methods[field] === 'function') {
          return handle.methods[field](obj);
        }

        return value;
      }

      handle.getterHandle(obj);

      return createProxy(value, {
        path: path.concat(field),
        handle,
      });
    },
    set: function(obj, field, newValue) {
      if (isNotProxy(field)) {
        return Reflect.set(obj, field, newValue, obj);
      }

      const oldValue = Reflect.get(obj, field, obj);

      if (isDiff(oldValue, newValue)) {
        const result = Reflect.set(obj, field, newValue, obj);
        const info = {
          path: path.concat(field),
          oldValue,
          newValue,
        };

        handle.setterHandle(info);
        return result;
      }

      return true;
    },
  });
}

function getDeepValue(obj, paths) {
  const field = paths.shift();
  const value = obj[field];
  if (!paths.length) {
    return value;
  }
  if (isNvl(value) || typeof value !== 'object') {
    return undefined;
  }
  return getDeepValue(value, paths);
}

class Agent {

  constructor(data = {}) {
    this.data = data;
    const handle = this.handle = new Handle({
      $pure: () => this.data,
      $manager: () => this,
      $watch: () => this.onWatch,
      $listen: () => this.listenHandle,
      $destroy: () => this.destroy,
      $onDestroy: () => this.destroyHandle,
      $onGet: (info) => (this.onGet && this.onGet(info)),
      $onSet: (info) => this.changeHandle(info),
    });

    return this.proxy = createProxy(data, {
      handle
    });
  }

  watchMap = new Map();
  listenSet = new Set();
  destroySet = new Set();
  history = [];
  splitMarker = '.';
  changing = 0;
  destroyed = false;
  maxCascade = 10;

  onWatch = (handles, initRun = false) => {
    if (this.destroyed) {
      return Function.prototype;
    }

    let callbacks = [];

    for (let field in handles) {
      let set = this.watchMap.get(field);
      if (!set) {
        set = new Set();
        this.watchMap.set(field, set);
      }

      const callback = handles[field];

      set.add(callback);
      callbacks.push(callback);
      if (initRun) {
        const value = getDeepValue(this.data, field.split(this.splitMarker));
        callback(value, {
          init: true,
          data: this.data,
        });
      }
    }

    return () => {
      if (callbacks && this.watchMap) {
        callbacks.forEach(callback => set.delete(callback));
        callbacks = null;
      }
    }
  }

  changeHandle = (info) => {
    this.changing++;
    if (this.changing > this.maxCascade) {
      this.history = [];
      return;
    }
    this.history.push(info);

    const set = this.watchMap.get(info.path.join(this.splitMarker));
    if (set) {
      const newInfo = {
        ...info,
        data: this.data,
        init: false,
        history: [...this.history],
        observeType: 'watch',
      };
      Array.from(set.values()).forEach(f => f(info.newValue, newInfo));
    }

    this.changing--;
    if (this.changing === 0) {
      const newInfo = {
        ...info,
        data: this.data,
        init: false,
        history: [...this.history],
        observeType: 'listen',
      };
      this.history = [];
      Array.from(this.listenSet.values()).forEach(f => f(this.data, newInfo));
    }
  }

  listenHandle = (callback) => {
    if (this.destroyed) {
      return Function.prototype;
    }

    this.listenSet.add(callback);

    return () => {
      this.listenSet && this.listenSet.delete(callback);
    };
  }

  destroyHandle = (callback) => {
    if (this.destroyed) {
      return Function.prototype;
    }

    this.destroySet.add(callback);

    return () => {
      this.destroySet && this.destroySet.delete(callback);
    };
  }

  destroy = () => {
    if (this.destroyed) {
      return;
    }
    this.destroyed = true;

    Array.from(this.destroySet.values()).forEach(f => f());

    this.destroySet.clear();
    this.destroySet = null;

    Array.from(this.watchMap.values()).forEach(set => set.clear());
    this.watchMap.clear();
    this.watchMap = null;

    this.listenSet.clear();
    this.listenSet = null;

    this.handle = null;
    this.proxy = null;
  }
}

exports.Agent = Agent;
