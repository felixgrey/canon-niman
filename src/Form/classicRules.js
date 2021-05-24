/*
  《中华人民共和国国家标准:人的性别代码(GB 2261-1980)》
  0 - 未知的性别
  1 - 男性
  2 - 女性
  9 - 未说明的性别
*/
function checkIdcode(idcode, ext) {

  const {
    syntaxErr = '身份证号码格式不正确',
      checkErr = '校验未通过',
      male = '男',
      female = '女',
  } = ext;

  const regStr = "(\\d{2})(\\d{2})(\\d{2})(\\d{4})(\\d{2})(\\d{2})(\\d{2})(\\d{1})([0-9X]{1})";

  if (!new RegExp(regStr, 'g').test(idcode)) {
    return {
      pass: false,
      syntaxErr: true,
      err: [syntaxErr],
    }
  }

  let data = {};

  idcode.replace(RegExp(regStr, 'g'), function(a, ...args) {
    const [province, city, district, year, month, date, orderNo, sexNo, checkNo] = args;
    data = {
      province,
      city,
      district,
      year,
      month,
      date,
      orderNo,
      sexNo,
      checkNo
    };
  });

  // 校验系数
  const checkCoefficient = [
    7, 9, 10, 5,
    8, 4, 2, 1,
    6, 3, 7, 9,
    10, 5, 8, 4,
    2
  ];

  const lastCodeMap = ['1', '0', 'X', '9', '8', '7', '6', '5', '4', '3', '2'];

  const codeArr = Array.from(idcode);
  const lastCode = codeArr.pop();
  const checkCodeIndex = codeArr.reduce((count, no, index) => {
    no = Number(no)
    return count + no * checkCoefficient[index];
  }, 0) % 11;

  const result = {
    no: idcode,
    address: {
      province: data.province,
      city: data.city,
      district: data.district,
    },
    birthday: {
      year: data.year,
      month: data.month,
      date: data.date,
    },
    syntaxErr: false,
    pass: lastCodeMap[checkCodeIndex] === lastCode,
    sex: data.sexNo % 2 ? '1' : '2',
    sexLabel: data.sexNo % 2 ? male : female,
  }

  if (!result.pass) {
    result.err = result.err || [];
    result.err = result.err.push(checkErr);
  }

  return result;
}

export function createIdcardChecker(ext = {}) {
  // value, record, index, formData

  const {
    returnType = 'pass' // pass all;
  } = ext;

  return function(idcode) {
    const result = checkIdcode(idcode, ext);

    if (returnType === 'pass') {
      return result.pass;
    }
    return result;
  }
}

export function createMobileChecker(ext = {}) {
  // value, record, index, formData

  const {
    returnType = 'pass' // pass all;
  } = ext;

  return function(num) {
    const numStr = `${num}`;
    const result = {};
    result.pass = numStr.length === 11 && numStr.charAt(0) === '1';

    if (returnType === 'pass') {
      return result.pass;
    }
    return result;
  }
}
