export default class PlottingScale {
  constructor(arg) {
    this.init(arg);
  }

  init(arg = {}) {
    const {
      width = 5000, // 像素宽度
        logicWidth = 10000, // 逻辑宽度
        widthDialStep = null, // 逻辑标尺精度

        height = 200, // 像素高度
        logicHeight = 100, // 逻辑高度
        heightDialStep = null, // 逻辑标尺精度

        dialLengthPx = 10, // 刻度线长（像素）

        zeroX = null, // 0刻度位置X
        zeroY = null, // 0刻度位置Y

        zeroXpx = width / 2,
        zeroYpx = height / 2,

        widthDialStepPx = width / 200,
        heightDialStepPx = height / 10,
    } = arg;

    Object.assign(this, {
      width,
      logicWidth,
      widthDialStep,
      widthDialStepPx,

      height,
      logicHeight,
      heightDialStep,
      heightDialStepPx,

      zeroX,
      zeroXpx,
      zeroY,
      zeroYpx,

      dialLengthPx,
    });

    if (zeroX === null) {
      this.zeroX = this.widthPxToLogic(zeroXpx);
    } else {
      this.zeroXpx = this.widthLogicToPx(zeroX);
    }

    if (zeroY === null) {
      this.zeroY = this.heightPxToLogic(zeroYpx);
    } else {
      this.zeroYpx = this.heightLogicToPx(zeroY);
    }

    if (widthDialStep === null) {
      this.widthDialStep = this.widthPxToLogic(widthDialStepPx);
    } else {
      this.widthDialStepPx = this.widthLogicToPx(widthDialStep);
    }

    if (heightDialStep === null) {
      this.heightDialStep = this.heightPxToLogic(heightDialStepPx);
    } else {
      this.heightDialStepPx = this.heightLogicToPx(heightDialStep);
    }


    this.widthStepCount = logicWidth / this.widthDialStep;
    this.heightStepCount = logicHeight / this.heightDialStep;

    this.xDialLength = this.heightPxToLogic(dialLengthPx);
    this.yDialLength = this.widthPxToLogic(dialLengthPx);

    this.middleX = logicWidth / 2;
    this.middleY = logicHeight / 2;

    this.minX = -this.zeroX;
    this.minY = -this.zeroY;

    this.maxX = logicWidth - this.zeroX;
    this.maxY = logicHeight - this.zeroY;

    this.xDialPositions = [];
    for (let i = 0; i <= this.widthStepCount; i++) {
      this.xDialPositions.push(i * this.widthDialStep - this.zeroX);
    }

    this.yDialPositions = [];
    for (let i = 0; i <= this.heightStepCount; i++) {
      this.yDialPositions.push(i * this.heightDialStep - this.zeroY);
    }
  }

  widthLogicToPx(x) {
    return x * this.width / this.logicWidth;
  }

  heightLogicToPx(y) {
    return y * this.height / this.logicHeight
  }

  widthPxToLogic(px) {
    return px * this.logicWidth / this.width;
  }

  heightPxToLogic(py) {
    return py * this.logicHeight / this.height;
  }

  logicToPx([x, y]) {
    x = x + this.zeroX;
    y = y + this.zeroY;

    const px = this.widthLogicToPx(x);
    const py = this.heightLogicToPx(y);

    return [px, py, 'px'];
  }

  pxTologic([px, py]) {
    let x = this.widthPxToLogic(px);
    let y = this.heightPxToLogic(py);

    x = x - this.zeroX;
    y = y - this.zeroY;

    return [x, y, 'll'];
  }

}
