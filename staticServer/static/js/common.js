// const ajaxUrl = 'http://192.168.43.165:8091/sicd/api/claim'
const ajaxUrl = '/sicd/api/claim'

let getCode = function (callback) {
    if(sessionStorage.getItem('openId') && sessionStorage.getItem('openId') !== 'undefined') {
        isRegist(callback)
        return false;
    }
    let code = getUrlParam('code');
    let local = window.location.href;
    let APPID = 'wx0abb5ad71c9c182d';
    if (code == null || code === '') {
        window.location.href = 'https://open.weixin.qq.com/connect/oauth2/authorize?appid=' + APPID + '&redirect_uri=' + encodeURIComponent(local) + '&response_type=code&scope=snsapi_base&state=#wechat_redirect'
    } else {
        getOpenId(code, callback)
    }
}
let getOpenId = function(code, callback){
    $.ajax({
        type: 'GET',
        dataType: 'json',
        url: ajaxUrl + '/appinfo/getOpenid?code=' + code,
        data: {},
        success: function (res) {
            if(res.response === 'error'){
                $.toast(res.error, 'forbidden');
            }else{
                sessionStorage.setItem("openId", res.ok);
                isRegist(callback)
            }
        }
    });
}
let getUrlParam= function(name) {
    var reg = new RegExp("(^|&)" + name + "=([^&]*)(&|$)");
    var r = window.location.search.substr(1).match(reg);
    if (r != null) return unescape(r[2]);
    return null;
}
let isRegist = function(callback){
    $.ajax({
        type: 'GET',
        dataType: 'json',
        url: ajaxUrl + '/appinfo/isRegister?openId=' + sessionStorage.openId,
        data: {},
        success: function (res) {
            if(res.response === 'error'){
                $.toast(res.error, 'forbidden');
            }else{
                if(!res.ok){
                    sessionStorage.setItem('backUrl', window.location.href)
                    window.location.href = 'regist.html'
                }else{
                    $('#wrap').show()
                    callback && callback()
                }
            }
        }
    });
}

let init = function(callback){
    getCode(callback)
}