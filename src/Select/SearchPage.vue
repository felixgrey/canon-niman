<template>
  <view>
    <uni-card style="min-height: calc(100vh - 22px);">
      <uni-easyinput :value="labelText" @input="changeSearch" :placeholder="placeholder" />
      <uni-list v-if="data.length" style="margin-top: 12px;">
        <uni-list-item clickable @click="changeSelect(item[valueField])" v-for="item in data" :data="item" :title="item[labelField]"></uni-list-item>
      </uni-list>
      <view style="position: fixed; bottom: 22px; width: calc(100% - 44px);">
        <button type="default" @click="back()">返回</button>
        <button v-if="muti"  @click="selectDone()" type="primary">确定</button>
      </view>
    </uni-card>
  </view>
</template>

<script>
import SearchModel from './SearchModel.js';

const myPath = 'pages/SearchPage/SearchPage';

export function registerSearchPage(Vue) {
  Vue.prototype.$$context = Vue.prototype.$$context || {};
  Vue.prototype.$$context.searchInfo = {};
  Vue.prototype.$$openSearchPage = function(config = {}) {
    const path = global.location.hash.replace('#/','').split('?')[0];
    const notSelf = path !== myPath;
    
    this.$$context.searchInfo = {
      ...config,
      path,
      notSelf,
    };

    if (notSelf) {
      uni.navigateTo({
        url: myPath
      });
    }
  };
}

export default {
  data() {
    return {
      placeholder: '',
      value: '',
      data: [],
      muti: false,
      labelText: '',
      labelField: '',
      valueField: ''
    };
  },
  created() {
    this.searchModel = new SearchModel({});
  },
  mounted() {
    this.init();
  },
  onLoad() {
    this.searchModel && this.init();
  },
  methods: {
    init() {
      const {
        labelField = 'label',
        valueField = 'value',
        data = [],
        muti = false,
        frequency = 500,
        placeholder = '请输入',
        onSearch = Function.prototype,
        callback = Function.prototype,
        value = undefined
      } = this.$$context.searchInfo;

      this.searchModel.startSelect(value, data, {
        labelField,
        valueField
      });

      this.searchModel.onSearch = async text => {
        const result = await onSearch(text);
        if (Array.isArray(result)) {
          this.data = result;
          this.searchModel.startSelect(value, this.data);
        }
      };

      this.placeholder = placeholder;
      this.value = value;
      this.data = data;
      this.muti = muti;
      this.labelField = labelField;
      this.valueField = valueField;
      this.labelText = '';
    },
    changeSearch(v) {
      this.searchModel.onInput(v);
    },
    back() {
      const {
        notSelf = false,
      } = this.$$context.searchInfo;
      if (notSelf) {
        uni.navigateBack({});
      }
    },
    selectDone() {
      this.searchModel.selectDone();
      
      const {
        callback = Function.prototype,
      } = this.$$context.searchInfo;

      setTimeout(() => {
        this.$$context.searchInfo = {};
        callback(this.searchModel.getItem());
      }, 20);
      this.back();
    },
    changeSelect(v) {
      this.searchModel.changeSelect(v);
      this.labelText = '';

      if (!this.muti) {
        this.selectDone();
      }
    }
  }
};
</script>

<style></style>
