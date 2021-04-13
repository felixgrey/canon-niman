function setCascade(fields = [], agent, extend = {}) {
  const watchConfig = {};
  const {
    getNvl = () => null,
  } = extend;

  for (let i = 0; i < fields.length - 1; i++) {
    const [
      field,
      onChange = Function.prototype,
      onInit = Function.prototype
    ] = fields[i];

    const [nextField] = fields[i + 1];

    watchConfig[field] = (value, {
      init,
      data
    }) => {
      if (!init) {
        agent[nextField] = getNvl(nextField, data);
        onChange(value, data);
      } else {
        onInit(value, data, onChange);
      }
    }
  }

  return agent.$watch(watchConfig, true);
}

export default setCascade;
// module.exports = setCascade;