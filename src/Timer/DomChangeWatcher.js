import position from 'metal-position';
import Timer from './Timer.js';

export default class DomChangeWatcher {
  constructor(op = {}) {

    const {
      dom,
      changeHandle = Function.prototype,
      changeShowHandle = Function.prototype,
      changeSizeHandle = Function.prototype,
      changePositionHandle = Function.prototype,
      changeDomStyleHandle = Function.prototype,
      customCheck = () => true,
    } = op;

    this.dom = typeof dom === 'string' ? document.getElementById(dom) : dom;

    this.changeHandle = changeHandle;
    this.changeShowHandle = changeShowHandle;
    this.changeSizeHandle = changeSizeHandle;
    this.changePositionHandle = changePositionHandle;
    this.changeDomStyleHandle = changeDomStyleHandle;
    this.customCheck = customCheck;

    this.lastState = {
      ...position.getRegion(this.dom),
      show: this.checkShow(this.dom),
    };

    this.timer = new Timer({
      pulseHandle: () => {
        this.checkChange();
      },
      interval: 40,
    }).run();
  }

  checkShow(dom) {
    if (!dom) {
      return false;
    }

    const flag = this.customCheck(dom);
    if (!flag) {
      return false;
    }

    let parent = dom.parentNode;

    while (parent && parent !== document) {

      if (parent.getAttribute('role') === 'tabpanel' &&
        parent.getAttribute('aria-hidden') === 'true') {
        return false;
      }

      if (parent.style && parent.style.display === 'none') {
        return false;
      }

      parent = parent.parentNode;
    }

    return true;
  }

  checkChange() {
    if (this.destroyed) {
      return;
    }

    const currentState = {
      ...position.getRegion(this.dom),
      show: this.checkShow(this.dom),
    };
    const lastState = this.lastState;
    this.lastState = currentState;

    let changed = false;
    let sizeChanged = false;
    let positionChanged = false;
    const {
      show,
      height,
      width,
      left,
      bottom,
      right,
      top,
    } = currentState;

    if (show !== lastState.show) {
      changed = true;
      this.changeShowHandle(show);
    }

    if (height !== lastState.height || width !== lastState.width) {
      changed = true;
      sizeChanged = true;
      this.changeSizeHandle(width, height);
    }

    if (top !== lastState.top || right !== lastState.right ||
      bottom !== lastState.bottom || left !== lastState.left) {
      changed = true;
      positionChanged = true;
      this.changePositionHandle(top, right, bottom, left);
    }

    if (sizeChanged || positionChanged) {
      this.changeDomStyleHandle({
        ...currentState
      });
    };


    if (changed) {
      this.changeHandle({
        ...currentState
      });
    }

    return changed;
  }

  run() {
    if (this.destroyed) {
      return this;
    }

    this.timer.run();
    return this;
  }

  stop() {
    if (this.destroyed) {
      return this;
    }

    this.timer.stop();
    return this;
  }

  destroy() {
    if (this.destroyed) {
      return;
    }
    this.destroyed = true;
    this.timer.stop();
    this.timer = null;
    this.dom = null;
    this.lastState = null;
  }
}
