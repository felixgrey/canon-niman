export function decodeByList(list = [], opt = {}) {
  const {
    labelField = 'label',
      valueField = 'value',
  } = opt;

  const decodeMap = {};
  const decodeList = list.map(item => {
    decodeMap[item[valueField]] = item[labelField];
    decodeMap[item[labelField]] = item[valueField];
    return {
      label: item[labelField],
      value: item[valueField],
    }
  });

  return {
    decodeMap,
    decodeList,
  }
}

export function decodeByFields(fields = []) {
  const decoder = {
    decodeList: {},
    decodeMap: {},
  };

  fields.forEach(fieldInfo => {
    const {
      field,
      extend: {
        labelField = 'label',
        valueField = 'value',
        data = [],
      } = {}
    } = fieldInfo;

    const {
      decodeList,
      decodeMap
    } = decodeByList(data, {
      labelField,
      valueField
    });

    decoder.decodeList[field] = decodeList;
    decoder.decodeMap[field] = decodeMap;

  });

  return decoder;
}
