const defaultOp = {
  dragStartHandle: Function.prototype,
  dragingHandle: Function.prototype,
  dragEndHandle: Function.prototype,
  zoomHandle: Function.prototype,
  zoomStep: 1,
  zoomStepScale: 0.5,
  maxZoom: 8,
  minZoom: 0.125,
  zoomAble: true,
  wheelAble: true,
  hasBoundary: false,
};

function inDom(dom, dom2) {
  if (dom === dom2) {
    return true;
  }
  const parentNode = dom.parentNode;
  if (parentNode && parentNode !== global.document) {
    return inDom(parentNode, dom2);
  }
  return false;
}

export default class Dragable {
  constructor(container, target, op = {}) {
    this.container = container;
    this.target = target;
    Object.assign(this, defaultOp, op);
    this.init();
    this.runTransform();
  }
  init() {
    this.container.setAttribute('draggable', 'false');
    this.container.style.userSelect = 'none';
    this.container.style.cursor = 'move';

    this.target.setAttribute('draggable', 'false');
    this.target.style.cursor = 'move';

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
  mousewheel = (e) => {
    if (this.destroyed) {
      return;
    }
    if (this.zoomAble === false || this.wheelAble === false) {
      return;
    }
    if (!inDom(e.target, this.container)) {
      return;
    }

    e.cancelBubble = true;
    e.stopPropagation();
    e.preventDefault();

    if (this.lastWheel) { // 防抖
      if (Date.now() - this.lastWheel < 80) {
        return false;
      }
    }
    this.lastWheel = Date.now();
    if (e.deltaY < 0) {
      this.zoomIn(e);
    } else if (e.deltaY > 0) {
      this.zoomOut(e);
    } else {
      return false;
    }
    this.zoomHandle(this.warpEvent(e, 'zoom'));

    return false;
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
  zoomIn(_e) {
    let zoom = this.dragAttribute.zoom;
    if (zoom > 1) {
      zoom = parseInt(this.dragAttribute.zoom + this.zoomStep);
    } else {
      zoom = this.dragAttribute.zoom / this.zoomStepScale;
    }
    this.zoomTo(zoom, _e);
  }
  zoomOut(_e) {
    let zoom = this.dragAttribute.zoom;
    if (zoom > 1) {
      zoom = parseInt(this.dragAttribute.zoom - this.zoomStep);
    } else {
      zoom = this.dragAttribute.zoom * this.zoomStepScale;
    }
    this.zoomTo(zoom, _e);
  }
  zoomTo = (z = this.dragAttribute.zoom, _e) => {
    if (this.destroyed) {
      return;
    }
    if (this.zoomAble === false || z <= 0) {
      return;
    }
    if (z < this.minZoom) {
      z = this.minZoom;
    }
    if (z > this.maxZoom) {
      z = this.maxZoom;
    }

    const oldZoom = this.dragAttribute.zoom;
    this.dragAttribute.zoom = z;

    const {
      x,
      y,
    } = this.dragAttribute;

    this.moveTo(x * z / oldZoom, y * z / oldZoom, _e);
  }

  calcBoundary(value, boundary, offset = 0) {

    const theValue = value - offset;

    if (boundary === 0) {
      return 0;
    }

    if (theValue * boundary < 0) {
      return offset;
    }

    const theBoundary = boundary + offset;

    if (Math.abs(value) > Math.abs(theBoundary)) {
      return theBoundary;
    }

    return value;
  }

  runTransform(_e) {
    const {
      x,
      y,
      zoom
    } = this.dragAttribute;

    let {
      offsetWidth: oX,
      offsetHeight: oY,
    } = this.container;

    if (_e) {
      const {
        offsetX,
        offsetY,
        target,
      } = _e;
      // TODO
    }

    if (this.transformOrigin) {
      this.target.style.transformOrigin = this.transformOrigin;
    } else {
      this.target.style.transformOrigin = `${oX / 2}px ${oY / 2}px`;
    }

    const zoomX = this.lockX === true ? 1 : zoom;
    const zoomY = this.lockY === true ? 1 : zoom;

    this.target.style.transform = `matrix(${zoomX},0,0,${zoomY},${x},${y})`;
  }

  moveTo(x = this.dragAttribute.x, y = this.dragAttribute.y, _e = null) {
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

    const zoom = this.dragAttribute.zoom;

    if (this.hasBoundary) {
      const boundaryX = containerWidth - targetWidth * zoom;
      x = this.calcBoundary(x, boundaryX, containerWidth * (zoom - 1) / 2);
      const boundaryY = containerHeight - targetHeight * zoom;
      y = this.calcBoundary(y, boundaryY, containerHeight * (zoom - 1) / 2);
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

    this.runTransform(_e);

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
