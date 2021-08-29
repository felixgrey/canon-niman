const defaultOp = {
  dragStartHandle: Function.prototype,
  dragingHandle: Function.prototype,
  dragEndHandle: Function.prototype,
  zoomHandle: Function.prototype,
  zoomStep: 1,
  maxZoom: 10,
  minZoom: 1,
  zoomAble: true,
  wheelAble: true,
  hasBoundary: false,
};

export default class Dragable {
  constructor(container, target, op = {}) {
    this.container = container;
    this.target = target;
    Object.assign(this, defaultOp, op);
    this.init();
  }
  init() {
    this.container.setAttribute('draggable', 'false');
    this.container.style.userSelect = 'none';
    this.target.setAttribute('draggable', 'false');
    this.target.style.cursor = 'move';
    this.target.style.transformOrigin = 'left top';
    this.dragAttribute = {
      mouseDown: false,
      startX: null,
      startY: null,
      mouseDownX: null,
      mouseDownY: null,
      mouseX: null,
      mouseY: null,
      zoom: 1,
      x: 0,
      y: 0,
    };
    this.container.addEventListener('mousedown', this.mousedown);
    this.container.addEventListener('mousemove', this.mousemove);
    this.container.addEventListener('mouseup', this.mouseup);
    this.container.addEventListener('mousewheel', this.mousewheel);

    global.addEventListener('mousemove', this.mousemove, true);
    global.addEventListener('mouseup', this.mouseup, true);
  }
  warpEvent(e, name, merge = {}) {
    const {
      mouseX,
      mouseY
    } = this.getMouseXY(e);

    const {
      offsetWidth: containerWidth,
      offsetHeight: containerHeight,
    } = this.container;

    const {
      offsetWidth: targetWidth,
      offsetHeight: targetHeight,
    } = this.target;

    return {
      timestamp: Date.now(),
      nativeEvent: e,
      eventName: name,
      containerWidth,
      containerHeight,
      targetWidth,
      targetHeight,
      ...this.dragAttribute,
      ...merge,
    };
  }
  getMouseXY(e) {
    return {
      mouseX: e.screenX,
      mouseY: e.screenY,
    };
  }
  mousedown = (e) => {
    if (this.destroyed) {
      return;
    }
    const {
      mouseX,
      mouseY
    } = this.getMouseXY(e);
    this.dragAttribute.mouseDown = true;

    this.dragAttribute.startX = this.dragAttribute.x;
    this.dragAttribute.startY = this.dragAttribute.y;

    this.dragAttribute.mouseDownX = mouseX;
    this.dragAttribute.mouseDownY = mouseY;

    this.dragAttribute.mouseX = mouseX;
    this.dragAttribute.mouseY = mouseY;

    this.dragStartHandle(this.warpEvent(e, 'dragstart'));
  }
  mouseup = (e) => {
    if (this.destroyed) {
      return;
    }
    this.dragAttribute.mouseDown = false;

    this.dragEndHandle(this.warpEvent(e, 'draggend'));
  }
  calcMove() {
    const {
      startX,
      startY,
      mouseDownX,
      mouseDownY,
      mouseX,
      mouseY,
      x,
      y,
    } = this.dragAttribute;
    return {
      newX: mouseX - mouseDownX + startX,
      newY: mouseY - mouseDownY + startY,
    };
  }
  inDom(dom, dom2) {
    if (dom === dom2) {
      return true;
    }
    const parentNode = dom.parentNode;
    if (parentNode && parentNode !== global.document) {
      return this.inDom(parentNode, dom2);
    }
    return false;
  }
  mousewheel = (e) => {
    if (this.destroyed) {
      return;
    }
    if (this.zoomAble === false || this.wheelAble === false) {
      return;
    }
    if (!this.inDom(e.target, this.target)) {
      return;
    }

    e.cancelBubble = true;
    e.stopPropagation();

    if (this.lastWheel) { // 防抖
      if (Date.now() - this.lastWheel < 80) {
        return;
      }
    }
    this.lastWheel = Date.now();
    if (e.deltaY < 0) {
      this.zoomIn();
    } else if (e.deltaY > 0) {
      this.zoomOut();
    } else {
      return;
    }
    this.zoomHandle(this.warpEvent(e, 'zoom'));
  }
  mousemove = (e) => {
    if (this.destroyed) {
      return;
    }
    if (!this.dragAttribute.mouseDown) {
      return;
    }

    const {
      mouseX,
      mouseY
    } = this.getMouseXY(e);

    this.dragAttribute.mouseX = mouseX;
    this.dragAttribute.mouseY = mouseY;

    const {
      newX,
      newY,
    } = this.calcMove();
    this.moveTo(newX, newY);
    this.dragingHandle(this.warpEvent(e, 'dragging'));
  }
  zoomIn() {
    this.zoomTo(parseInt(this.dragAttribute.zoom + this.zoomStep));
  }
  zoomOut() {
    this.zoomTo(parseInt(this.dragAttribute.zoom - this.zoomStep));
  }
  zoomTo = (z = this.dragAttribute.zoom) => {
    if (this.destroyed) {
      return;
    }
    if (this.dragAttribute.zoomAble === false || z <= 0) {
      return;
    }
    if (z < this.minZoom) {
      z = this.minZoom;
    }
    if (z > this.maxZoom) {
      z = this.maxZoom;
    }
    this.dragAttribute.zoom = z;

    const {
      x,
      y
    } = this.dragAttribute;

    this.runTransform();
  }

  calcBoundary(value, boundary) {

    if (value * boundary < 0 || boundary === 0) {
      return 0;
    }

    if (Math.abs(value) > Math.abs(boundary)) {
      return boundary;
    }

    return value;
  }

  runTransform() {
    const {
      x,
      y,
      zoom
    } = this.dragAttribute;
    this.target.style.transform = `matrix(${zoom},0,0,${zoom},${x},${y})`;
  }

  moveTo(x = this.dragAttribute.x, y = this.dragAttribute.y) {
    if (this.destroyed) {
      return;
    }

    const {
      offsetWidth: containerWidth,
      offsetHeight: containerHeight,
    } = this.container;

    const {
      offsetWidth: targetWidth,
      offsetHeight: targetHeight,
    } = this.target;

    if (this.hasBoundary) {
      x = this.calcBoundary(x, containerWidth - targetWidth * this.dragAttribute.zoom);
      y = this.calcBoundary(y, containerHeight - targetHeight * this.dragAttribute.zoom);
    }

    const {
      lockX,
      lockY,
    } = this;

    if (!(lockX === true)) {
      this.dragAttribute.x = x;
    }

    if (!(lockY === true)) {
      this.dragAttribute.y = y;
    }

    this.runTransform();

  }
  destroy() {
    if (this.destroyed) {
      return;
    }

    this.container.removeEventListener('mousedown', this.mousedown);
    this.container.removeEventListener('mousemove', this.mousemove);
    this.container.removeEventListener('mouseup', this.mouseup);
    this.container.removeEventListener('mousewheel', this.mousewheel);

    global.removeEventListener('mousemove', this.mousemove, true);
    global.removeEventListener('mouseup', this.mouseup, true);

    this.container = null;
    this.target = null;
  }
}
