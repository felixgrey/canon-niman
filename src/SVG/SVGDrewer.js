const theDefaultStyle = {
  color: '#FFF',
  autoAdd: true,
  fontSize: 12,
  offset: [0, 0],
  width: 1,
  fillColor: 'transparent',
  text: null,
  strokeDasharray: null,
};

function createENS(tag) {
  return document.createElementNS("http://www.w3.org/2000/svg", tag);
}

export default class SVGDrewer {
  constructor(arg = {}) {
    let {
      dom,
      plottingScale,
      defaultStyle = {}
    } = arg;

    this.defaultStyle = {
      ...theDefaultStyle,
      ...defaultStyle,
    };

    if (typeof dom === 'string') {
      dom = document.getElementById(dom);
    }

    this.container = dom;
    this.plottingScale = plottingScale;

    this.createSVG();
  }

  methods = [
    "addG",
    "drewText",
    "drewCircle",
    "drewLine",
    "drewPolygon",
    "drewPolyline",
    "remove",
  ];

  createSVG() {

    const {
      width,
      logicWidth,
      height,
      logicHeight,
    } = this.plottingScale;

    const svg = createENS("svg");;

    svg.setAttribute('width', `${width}px`);
    svg.setAttribute('height', `${height}px`);

    this.svg = svg;
    this.container.appendChild(svg);
    return svg;
  }

  addG = (style = {}) => {
    const {
      id,
      autoAdd,
    } = {
      ...this.defaultStyle,
      ...style
    };

    const g = createENS("g");;

    if (id) {
      g.setAttribute('id', id);
    }

    autoAdd && this.svg.appendChild(g);

    return g;
  }

  drewText = ([x, y], str = '', style = {}) => {

    const {
      id,
      color,
      autoAdd,
      fontSize,
      offset,
    } = {
      ...this.defaultStyle,
      ...style
    };

    const text = createENS("text");

    if (id) {
      text.setAttribute('id', id);
    }

    const [nX, nY] = this.plottingScale.logicToPx([x, y]);

    text.setAttribute('x', nX + offset[0]);
    text.setAttribute('y', nY + offset[1]);
    text.setAttribute('fill', color);
    text.setAttribute('style', `font-size:${fontSize}px;`);
    text.innerHTML = str;

    autoAdd && this.svg.appendChild(text);

    return text;
  }

  drewCircle = ([x, y], radius = 8, style = {}) => {
    const {
      id,
      width,
      color,
      fillColor,
      autoAdd,
    } = {
      ...this.defaultStyle,
      ...style
    };

    const circle = createENS("circle");

    if (id) {
      circle.setAttribute('id', id);
    }

    const [nX, nY] = this.plottingScale.logicToPx([x, y]);

    circle.setAttribute('style',
      `fill:${fillColor};stroke:${color};stroke-width:${width};`);
    circle.setAttribute('cx', nX);
    circle.setAttribute('cy', nY);
    circle.setAttribute('r', radius);
    autoAdd && this.svg.appendChild(circle);

    return circle;
  }

  drewLine = ([x1, y1], [x2, y2], style = {}) => {
    const {
      id,
      width,
      color,
      autoAdd,
      text,
      strokeDasharray
    } = {
      ...this.defaultStyle,
      ...style
    };

    const line = createENS("line");

    if (id) {
      line.setAttribute('id', id);
    }

    const [nX1, nY1] = this.plottingScale.logicToPx([x1, y1]);
    const [nX2, nY2] = this.plottingScale.logicToPx([x2, y2]);

    const {
      pointsAttr,
      center,
      logicCenter,
    } = this.calcCenter([
      [nX1, nY1],
      [nX2, nY2]
    ]);

    line.setAttribute('style', `stroke:${color};stroke-width:${width}`);
    line.setAttribute('x1', nX1);
    line.setAttribute('y1', nY1);
    line.setAttribute('x2', nX2);
    line.setAttribute('y2', nY2);

    if (strokeDasharray !== null) {
      line.setAttribute('stroke-dasharray', strokeDasharray);
    }

    line.setAttribute('data-points', pointsAttr);
    line.setAttribute('data-center', `[${center[0]},${center[1]}]`);
    line.setAttribute('data-logic-center', `[${logicCenter[0]},${logicCenter[1]}]`);

    autoAdd && this.svg.appendChild(line);

    if (text !== null) {
      this.drewText([logicCenter[0] - 14, logicCenter[1] + 8], text, style);
    }

    return line;
  }

  calcCenter(points = []) {
    const pointsAttr = [];
    let centerX = 0;
    let centerY = 0;

    points.map(([x, y]) => {
      pointsAttr.push(`${x},${y}`);
      centerX += x;
      centerY += y;
      return [x, y];
    });

    centerX /= points.length;
    centerY /= points.length;

    const [x, y] = this.plottingScale.pxTologic([centerX, centerY]);

    return {
      pointsAttr: pointsAttr.join(' '),
      center: [centerX, centerY],
      logicCenter: [x, y],
    }
  }

  drewPolygon = (points = [], style = {}) => {
    const {
      id,
      width,
      color,
      fillColor,
      autoAdd,
    } = {
      ...this.defaultStyle,
      ...style
    };

    const polygon = createENS("polygon");

    if (id) {
      polygon.setAttribute('id', id);
    }
    const {
      pointsAttr,
      center,
      logicCenter,
    } = this.calcCenter(points.map(a => this.plottingScale.logicToPx(a)));

    polygon.setAttribute('points', pointsAttr);

    polygon.setAttribute('data-points', pointsAttr);
    polygon.setAttribute('data-center', `[${center[0]},${center[1]}]`);
    polygon.setAttribute('data-logic-center', `[${logicCenter[0]},${logicCenter[1]}]`);

    polygon.setAttribute('style',
      `fill:${fillColor};stroke:${color};stroke-width:${width};`);

    autoAdd && this.svg.appendChild(polygon);

    return polygon;
  }

  drewPolyline = (points = [], style = {}) => {
    const {
      id,
      width,
      color,
      fillColor,
      autoAdd,
    } = {
      ...this.defaultStyle,
      ...style
    };

    const polyline = createENS("polyline");

    if (id) {
      polyline.setAttribute('id', id);
    }
    const {
      pointsAttr,
      center,
      logicCenter,
    } = this.calcCenter(points.map(a => this.plottingScale.logicToPx(a)));

    polyline.setAttribute('points', pointsAttr);

    polyline.setAttribute('data-points', pointsAttr);
    polyline.setAttribute('data-center', `[${center[0]},${center[1]}]`);
    polyline.setAttribute('data-logic-center', `[${logicCenter[0]},${logicCenter[1]}]`);

    polyline.setAttribute('style',
      `fill:${fillColor};stroke:${color};stroke-width:${width};`);

    autoAdd && this.svg.appendChild(polyline);

    return polyline;
  }

  remove = (dom = []) => {
    [].concat(dom).forEach(d => {
      this.svg.removeChild(d);
    });
  }
}
