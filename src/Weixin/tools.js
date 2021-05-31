function toOffiaccountPage(biz, hid, extend = {}) {
  const urlSearchParams = new URLSearchParams();
  urlSearchParams.append('__biz', biz);
  urlSearchParams.append('hid', hid);
  for (let key in extend) {
    urlSearchParams.append(key, extend[key]);
  }
  window.location.href = `http://mp.weixin.qq.com/mp/homepage?${urlSearchParams}`
}

function buildToOffiaccountLink(appid, url, url2) {
  return 'https://open.weixin.qq.com/connect/oauth2/authorize?appid=' +
    appid + '&redirect_uri=' + encodeURIComponent(url) +
    '&response_type=code&scope=snsapi_base#wechat_redirect'
}
buildToOffiaccountLink('wx0abb5ad71c9c182d', 'https://cdmgt-hd.living-space.cn/sicd/anshanPublic.html');

// https://open.weixin.qq.com/connect/oauth2/authorize?appid=wx0abb5ad71c9c182d&redirect_uri=https%3A%2F%2Fcdmgt-hd.living-space.cn%2Fsicd%2FanshanPublic.html&response_type=code&scope=snsapi_base&state=1#wechat_redirect
