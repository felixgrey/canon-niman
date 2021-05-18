import Vue from 'vue';
import Ajax from './AabstractAjax.js';

Ajax.defaultParam = {
  ...Ajax.defaultParam,
  method: 'POST',
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

  setAbortHandle(() => {
    // 未支持
  });

  const config = beforeRequest({
    baseURL: baseUrl,
    url,
    fullUrl,
    method,
    data,
    params,
    timeout: 0,
    cancelToken: null,
  }, extend, instance, uni, 'uni.request');

  const result = await new Promise((resolve, reject) => {
    uni.request({
      url: config.fullUrl,
      method: config.method.toUpperCase(),
      data: config.data,
      header: config.header || {},
      success: resolve,
      fail: reject,
    });
  }).catch((error = {}) => {
    if (error.message === ABORT_SIGN) {
      return;
    }
    throw new Error(error);
  });

  return afterResponse(result, extend, instance);
};

Ajax.doFetch = doFetch;
Vue.prototype.$$Ajax = Ajax;

export {
  doFetch
}
