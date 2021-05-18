const axios = require('axios');
const Ajax = require('./AabstractAjax.js');

// import axios from 'axios';
// import Ajax from './AabstractAjax.js';

Ajax.defaultParam = {
  ...Ajax.defaultParam,
  afterResponse: (response, extend, instance) => {
    const {
      data,
      status,
    } = response || {};

    if (extend.submit) {
      return {
        status
      }
    }

    return data;
  }
};

const ABORT_SIGN = `abort_ajax_${Date.now()}`;

async function doFetch(param = {}) {
  let {
    baseUrl,
    url,
    fullUrl,
    method,

    data,
    dataType,
    params,

    setAbortHandle,
    beforeRequest,
    afterResponse,

    extend,
    instance,
  } = param;

  const CancelToken = axios.CancelToken;
  const source = CancelToken.source();

  setAbortHandle(() => {
    source.cancel(ABORT_SIGN);
  });

  const config = beforeRequest({
    baseURL: baseUrl,
    url,
    fullUrl,
    method,
    data,
    params,
    timeout: 0,
    cancelToken: source.token,
  }, extend, instance, axios, 'axios');

  const result = await axios(config).catch((error) => {
    if (error.message === ABORT_SIGN) {
      return;
    }
    throw new Error(error);
  });

  return afterResponse(result, extend, instance);
};

Ajax.doFetch = doFetch;

module.exports = Ajax;

// export default Ajax;
export {
  doFetch
}
