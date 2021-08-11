function formatNumber(v) {

}

export default {
  maxFixed(number, extendParam = {}) {
    const {
      fixed = 2
    } = extendParam;
    const numberN = Number(number);
    if (isNaN(numberN)) {
      return 0;
    }
    if (parseInt(number) === numberN) {
      return number;
    }
    return Number(numberN.toFixed(fixed));
  },
  percent(number, extendParam = {}) {
    const {
      fixed = 2,
        forceFixed = false,
        decimal = true,
        noSymbol = false,
        noZero = false,
        noSign = true,
        blank = '',
    } = extendParam;

    const percentSymbol = noSymbol ? '' : '%';

    if (isNvl(number) || isNaN(+number)) {
      return blank;
    }

    number = Number(number * (decimal ? 100 : 1)).toFixed(fixed);
    if (!forceFixed) {
      number = number.replace(/(\.\d*?)[0]*$/g, (a, b) => b.replace(/\.$/g, ''));
    }

    if (noZero) {
      number = number.replace(/^0\./g, '.')
    }

    if (noSign && parseFloat(number) === 0) {
      number = number.replace(/^\-|^\+/g, '');
    }

    return number + percentSymbol;
  },
  thsepar(number, extendParam = {}) {
    const {
      fixed = 2,
        forceFixed = false,
        noZero = false,
        noSign = true,
        blank = '',
    } = extendParam;

    if (isNvl(number) || isNaN(+number)) {
      return blank;
    }

    let number2 = parseInt(number);
    const decimal = number - number2;

    if (isNaN(number2) || isNaN(decimal)) {
      return blank;
    }

    number2 = Array.from(`${number2}`)
      .reverse()
      .map((c, index) => (index % 3 === 0 ? `${c},` : c))
      .reverse()
      .join('')
      .replace(/,$/g, '');

    if (decimal) {
      number2 += Number(decimal).toFixed(fixed).replace(/^0\.|^\-0\./g, '.');
    }

    if (!forceFixed) {
      number2 = number2.replace(/(\.\d*?)[0]*$/g, (a, b) => b.replace(/\.$/g, ''));
    }

    if (forceFixed && !decimal) {
      number2 = number2 + (Number(0).toFixed(fixed).replace('0.', '.'));
    }

    if (noZero) {
      number2 = number2.replace(/^0\./g, '.');
    }

    if (noSign && parseFloat(number2) === 0) {
      number2 = number2.replace(/^\-|^\+/g, '');
    }

    return number2;
  }
}
