import './Dragable.css';

const defaultOp = {
  dragStartHandle: Function.prototype,
  dragingHandle: Function.prototype,
  dragEndHandle: Function.prototype,
  zoomHandle: Function.prototype,
  zoomStep: 0.2,
  maxZoom: 10,
  minZoom: 0.1,
};

export default class Dragable {
  constructor(container, target, op = {}) {
    this.container = container;
    this.target = target;

    this.startZoom = 1;

    Object.assign(this, defaultOp, op);
    this.init();
  }

  init() {
    this.lastEvents = [];

    this.containerAttribute = {
      width: this.container.offsetWidth,
      height: this.container.offsetHeight,
      className: this.container.className || '',
      // draggable: this.container.getAttribute('draggable'),
    };

    if (!this.containerAttribute.className.includes('dragable-container')) {
      this.container.className =
        this.containerAttribute.className + ' dragable-container';
    }

    this.container.setAttribute('draggable', 'false');

    this.targetAttribute = {
      width: this.target.offsetWidth,
      height: this.target.offsetHeight,
      className: this.target.className || '',
      // draggable: this.target.getAttribute('draggable'),
    };

    if (!this.targetAttribute.className.includes('dragable-target')) {
      this.target.className =
        this.targetAttribute.className + ' dragable-target';
    }

    this.target.setAttribute('draggable', 'false');

    this.dragAttribute = {
      mouseDown: false,
      startX: null,
      startY: null,
      mouseX: null,
      mouseY: null,
      x: 0,
      y: 0,
      zoom: 1,
    };

    this.container.addEventListener('mousedown', this.mousedown);
    this.container.addEventListener('mousemove', this.mousemove);
    this.container.addEventListener('mouseup', this.mouseup);
    this.container.addEventListener('mousewheel', this.mousewheel);

    global.addEventListener('mouseup', this.mouseup, true);
  }

  warpEvent(e, name) {
    const {
      mouseX,
      mouseY
    } = this.getMouseXY(e);

    this.dragAttribute.mouseX = mouseX;
    this.dragAttribute.mouseY = mouseY;

    const warpedEvent = {
      timestamp: Date.now(),
      nativeEvent: e,
      eventName: name,
      ...this.dragAttribute,
    }

    if (this.lastEvents.length > 200) {
      this.lastEvents.shift();
    }

    this.lastEvents.push(warpedEvent);
  }

  getMouseXY(e) {
    // screen client offset
    return {
      mouseX: e.offsetX,
      mouseY: e.offsetY
    };
  }

  mousedown = (e) => {
    const {
      mouseX,
      mouseY
    } = this.getMouseXY(e);
    this.dragAttribute.mouseDown = true;
    this.dragAttribute.startX = mouseX;
    this.dragAttribute.startY = mouseY;

    const e2 = this.warpEvent(e, 'dragstart');
    this.dragStartHandle(e2);
  }

  mouseup = (e) => {
    this.dragAttribute.mouseDown = false;
    const e2 = this.warpEvent(e, 'draggend');
    this.dragEndHandle(e2);
  }

  calcMove() {
    const {
      startX,
      startY,
      mouseX,
      mouseY,
      x,
      y,
    } = this.dragAttribute;

    const dx = (mouseX - startX) || 0;
    const dy = (mouseY - startY) || 0;

    return {
      dx,
      dy,
      newX: x + dx,
      newY: y + dy,
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
    if (!this.inDom(e.target, this.target)) {
      return;
    }

    if (e.deltaY < 0) {
      this.zoomIn();
    } else if (e.deltaY > 0) {
      this.zoomOut();
    } else {
      return;
    }

    const e2 = this.warpEvent(e, 'zoom');
    this.zoomHandle(e2);
  }

  mousemove = (e) => {
    if (!this.inDom(e.target, this.target)) {
      this.dragAttribute.mouseDown = false;
      const e2 = this.warpEvent(e, 'draggend');
      this.dragEndHandle(e2);
    }

    if (!this.dragAttribute.mouseDown) {
      return;
    }

    const e2 = this.warpEvent(e, 'dragging');
    this.dragingHandle(e2);

    const {
      dx,
      dy,
      newX,
      newY,
    } = this.calcMove();

    this.moveTo(newX, newY);
  }

  zoomIn() {
    this.zoomTo(this.startZoom + this.zoomStep);
  }

  zoomOut() {
    this.zoomTo(this.startZoom - this.zoomStep);
  }

  zoomTo = (z = this.startZoom) => {
    if (this.destroyed) {
      return;
    }

    if (z < this.minZoom || z > this.maxZoom || z <= 0) {
      return;
    }

    this.startZoom = z;
    this.container.style.transform = `scale3d(${z},${z},${z})`;
  }

  moveTo(x = 0, y = 0) {
    if (this.destroyed) {
      return;
    }
    this.dragAttribute.x = x;
    this.dragAttribute.y = y;
    this.target.style.transform = `translate3d(${x}px,${y}px,0)`;
  }

  destroy() {
    if (this.destroyed) {
      return;
    }

    this.container.removeEventListener('mousedown', this.mousedown);
    this.container.removeEventListener('mousemove', this.mousemove);
    this.container.removeEventListener('mouseup', this.mouseup);
    this.container.removeEventListener('mousewheel', this.mousewheel);

    global.removeEventListener('mouseup', this.mouseup, true);

    this.container = null;
    this.target = null;
  }
}
