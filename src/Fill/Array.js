if (!Array.prototype.flat) {
  Array.prototype.flat = function(deep = 1) {
    const cloneArr = [...this];
    if (deep <= 0) {
      return cloneArr;
    }
    let i = 0;
    while (i < cloneArr.length) {
      let item = cloneArr[i];
      if (!Array.isArray(item)) {
        i++;
        continue;
      }
      item = item.flat(deep - 1);
      cloneArr.splice(i, 1, ...item);
      i += item.length;
    }
    return cloneArr;
  }
}
