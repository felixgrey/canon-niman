const none = Function.prototype;
const same = a => a;

function isNvl(v) {
  return v === undefined || v === null;
}

const BASE_URL = (() => {
  const {
    protocol = '', hostname = '', port = ''
  } = global.location || {};
  return `${protocol}//${hostname}${port ? `:${port}` : ''}`;
})();

let fetchIndex = 1;

class Ajax {
  constructor(namedFetch = {}, defaultParam = {}) {
    this.defaultParam = defaultParam;
    this.abortMap = new Map();
    for (let name in namedFetch) {
      this[name] = (param = {}) => {
        return this.fetch({
          ...namedFetch[name],
          ...param
        }, {
          fetchName: name
        });
      }
    }
  }

  abort(abortKey) {
    if (this.destroyed) {
      return;
    }

    const f = this.abortMap.get(abortKey);
    if (!f) {
      return false;
    }

    f();
    return true;
  }

  async fetch(param = {}, info = {}) {
    if (this.destroyed) {
      return;
    }

    param = {
      ...Ajax.defaultParam,
      ...this.defaultParam,
      ...param
    };

    let {
      baseUrl,
      url,
      method,
      data,
      params,
      dataType,
      abortKey,
      ifErrorValue = null,

      onFetch = none,
      onAbort = none,

      onSuccess = none,
      onError = none,

      beforeRequest,
      afterResponse,
    } = param;

    if (isNvl(abortKey)) {
      while (this.abortMap.get(`$$fetch-${fetchIndex++}`));
      abortKey = `$$fetch-${fetchIndex}`;
    }

    const setAbortHandle = (callback) => {
      const callback$2 = () => {
        const result = callback();
        onAbort(result);
        this.abortMap.delete(abortKey);
      }

      this.abortMap.set(abortKey, callback$2);
    }

    method = method.toUpperCase();
    dataType = dataType.toLowerCase();

    if (method === 'GET' && isNvl(params)) {
      params = data;
    }

    if (dataType === 'form' && !(data instanceof FormData)) {
      const formData = new FormData();
      if (typeof data === 'object' && !isNvl(data)) {
        for (let field in data) {
          formData.append(field, data[field]);
        }
      }
      data = formData;
    }

    let fullUrl;
    if (url.indexOf('://') !== -1) {
      fullUrl = url;
    } else {
      fullUrl = [
        baseUrl.replace(/\/$/, ''),
        '/',
        url.replace(/^\//, ''),
      ].join('');
    }

    const newParam = {
      baseUrl,
      url,
      fullUrl,
      method,
      setAbortHandle,
      data,
      dataType,
      params,
      beforeRequest,
      afterResponse,
      info,
      instance: this,
    };

    onFetch && onFetch(param);
    let result = ifErrorValue;
    try {
      result = await Ajax.doFetch(newParam);
      onSuccess(result);
    } catch (e) {
      onError(e);
    } finally {
      this.abortMap.delete(abortKey);
    }

    if (this.destroyed) {
      return;
    }
    return result;
  }

  destroyed = false;

  destroy() {
    if (this.destroyed) {
      return;
    }
    this.destroyed = true;

    Array.from(this.abortMap.values()).forEach(f => f());
    this.abortMap = null;
  }
}

Ajax.defaultParam = {
  baseUrl: BASE_URL,
  method: 'GET',
  dataType: 'json',
  onFetch: none,
  onCancel: none,
  onSuccess: none,
  onError: none,
  beforeRequest: same,
  afterResponse: same,
};

Ajax.same = same;
Ajax.none = none;
Ajax.isNvl = isNvl;

Ajax.doFetch = async function(param = {}, instance) {
  /*
  const {
   baseUrl,
   url,
   method,
   setAbortHandle,
   data,
   params,
   dataType,
   beforeRequest,
   afterResponse,
   info,
   instance,
  } = param;
  */

  throw new Error('must override Ajax.doFetch .');
}

module.exports = Ajax;
// export default Ajax;
