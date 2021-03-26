const axios = require('axios');
const Ajax = require('./AabstractAjax.js');

Ajax.defaultParam = {
  ...Ajax.defaultParam,
  afterResponse: (response, info, instance) => {
    const {
      data,
      status,
    } = response || {};
    
    if (info.submit) {
      return {
        status
      }
    }

    return data;
  }
};

const ABORT_SIGN = `abort_ajax_${Date.now()}`;

Ajax.doFetch = async function(param = {}) {
  let {
    baseUrl,
    url,
    method,

    data,
    dataType,
    params,

    setAbortHandle,
    beforeRequest,
    afterResponse,
    
    info,
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
    method,
    data,
    params,
    timeout: 0,
    cancelToken: source.token,
  }, info, instance, axios, 'axios');

  const result = await axios(config).catch((error) => {
    if (error.message === ABORT_SIGN) {
      return;
    }
    throw new Error(error);
  });

  return afterResponse(result, info, instance);
};

module.exports = Ajax;
