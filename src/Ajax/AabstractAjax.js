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

class Ajax {
  constructor(namedFetch = {}, defaultParam = {}) {
    this.defaultParam = defaultParam;
    this.abortMap = new Map();
    for (let name in namedFetch) {
      this[name] = (param = {}) => {
        return this.fetch({
          ...namedFetch[name],
          ...param
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

  async fetch(param = {}, info = {
    submit: false
  }) {
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
      stopKey,

      onFetch = none,
      onAbort = none,

      onSuccess = none,
      onError = none,

      beforeRequest,
      afterResponse,
    } = param;

    const setAbortHandle = (callback) => {
      if (isNvl(stopKey)) {
        return;
      }

      const callback$2 = () => {
        const result = callback();
        onAbort(result);
        this.abortMap.delete(stopKey);
      }

      this.abortMap.set(stopKey, callback$2);
    }

    method = method.toLowerCase();
    dataType = dataType.toLowerCase();

    if (method === 'get' && isNvl(params)) {
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

    const newParam = {
      baseUrl,
      url,
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
    let result;
    try {
      result = await Ajax.doFetch(newParam);
      onSuccess(result);
    } catch (e) {
      onError(e);
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
  method: 'get',
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
