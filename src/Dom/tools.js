export function inDom(dom, dom2) {
  if (dom === dom2) {
    return true;
  }
  const parentNode = dom.parentNode;
  if (parentNode && parentNode !== global.document) {
    return inDom(parentNode, dom2);
  }
  return false;
}

export function getDomOffset(inner, outer, theOffsetX = 0, theOffsetY = 0) {
  const {
    offsetLeft,
    offsetTop
  } = inner;

  theOffsetX += offsetLeft;
  theOffsetY += offsetTop;

  if (inner.parentNode !== outer) {
    const [x, y] = getDomOffset(inner.parentNode, outer, theOffsetX, theOffsetY);
    theOffsetX = x;
    theOffsetY = y;
  }

  return [theOffsetX, theOffsetY];
}
