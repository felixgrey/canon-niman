const TurboVue2 = {
  install(Vue) {
    Vue.$$replaceList =
      Vue.prototype.$$replaceList = function(a, b) {
        a.splice(0, a.length, ...b);
        return a;
      }
  }
}
export default TurboVue2;