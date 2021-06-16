import moment from 'moment';
import FormModelLite from './FormModelLite';

const defaultFormat = 'YYYY-MM-DD';

function isNvl(v) {
  return v === undefined || v === null;
}

export default class AntdFormLite extends FormModelLite {
  constructor(...args) {
    super(...args);
  }

  transformGet(fieldInfo, value) {
    const {
      dataType = '',
        valueType,
        extend: {
          format = defaultFormat
        } = {},
    } = fieldInfo;

    if (valueType !== 'moment') {
      return super.transformGet(fieldInfo, value);
    }

    if (isNvl(value)) {
      return null;
    }

    const isArray = Array.isArray(value) || /\[\]$/g.test(dataType);
    value = [].concat(value);

    if (dataType === 'timestamp') {
      value = value.map(v => moment(v));
    } else {
      value = value.map(v => moment(v, format));
    }

    if (isArray) {
      return value;
    }

    return value[0];
  }

  transformSet(fieldInfo, value) {
    const {
      valueType,
      dataType = '',
      extend: {
        format = defaultFormat
      } = {},
    } = fieldInfo;

    if (valueType !== 'moment') {
      return super.transformSet(fieldInfo, value);
    }

    const isArray = Array.isArray(value) || /\[\]$/g.test(dataType);
    value = [].concat(value);

    if (dataType === 'timestamp') {
      value = value.map(v => v.valueOf());
    } else {
      value = value.map(v => v.format(format));
    }

    if (isArray) {
      return value;
    }

    return value[0];
  }
}
