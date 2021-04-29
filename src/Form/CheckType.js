function checkType(dataType) {
  const result = {
    type: 'String',
    isArray: false,
  };
  
  if (typeof dataType === 'string') {
    dataType = dataType.trim().toLowerCase();
    if (/\[\]$/.test(dataType)) {
      result.isArray = true;
    }
    dataType = dataType.replace('[]','');
  }
  
  if (dataType === Number || dataType === 'number') {
    result.type = 'Number';
  } else if (dataType === Object || dataType === 'object') {
    result.type = 'Object';
  } else if (dataType === Array || dataType === 'array') {
    result.isArray = 'Array';
  } else if (dataType === Date || dataType === 'date' || dataType === 'moment') {
    result.type = 'Moment';
  } 

  return result;
}

// module.exports = checkType;
export default checkType;