<template>
  <view @click="openSearchPage" :class="inputClass">
    <text>{{ getLabel() }}</text>
    <uni-icons class="form-search-input-icon" type="search"></uni-icons>
  </view>
</template>

<script>
export default {
  name: 'SearchSelect',
  props: {
    value: {
      type: [String, Number, Object],
      default: undefined
    },
    disabled: {
      type: Boolean,
      default: false
    },
    theExtend: {
      type: Object,
      default: () => ({})
    }
  },
  data() {
    const { labelField = 'label', valueField = 'value', data = [], muti = false, placeholder = '请输入', recordValue = false, onSearch = Function.prototype } = this.theExtend;

    const decodeMap = data.reduce((map, item) => {
      map[item[valueField]] = item;
      return map;
    }, {});

    return {
      myValue: this.value,
      labelField,
      valueField,
      data: [...data],
      muti,
      placeholder,
      recordValue,
      onSearch,
      decodeMap
    };
  },
  computed: {
    inputClass() {
      const arr = ['form-search-input'];
      if (this.disabled) {
        arr.push(' disabled-input');
      }
      return arr.join(' ');
    }
  },
  methods: {
    getLabel() {
      if (this.myValue === undefined || this.myValue === null) {
        return;
      }
      const textValue = this.recordValue ? this.myValue[this.valueField] : this.myValue;

      let record = this.recordValue ? this.myValue : null;
      if (this.decodeMap.hasOwnProperty(textValue)) {
        record = this.decodeMap[textValue];
      }
      if (!record) {
        return textValue;
      }
      return record[this.labelField];
    },
    openSearchPage() {
      const { disabled, labelField, valueField, data, muti, placeholder, recordValue, onSearch } = this;
      if (disabled) {
        return;
      }
      
      const callback = item => {
        item = {
          ...item
        };
        
        if (!this.decodeMap[item[valueField]]) {
          this.decodeMap[item[valueField]] = item;
          data.push(item);
        }

        if (this.recordValue) {
          this.myValue = item;
        } else {
          this.myValue = item[valueField];
        }
        this.$emit('change', this.myValue);
      }
      
      let textValue = this.myValue;
      if (this.recordValue && this.myValue) {
        textValue = this.myValue[this.valueField];
      }

      this.$$openSearchPage({
        labelField,
        valueField,
        data,
        value: textValue,
        muti,
        placeholder,
        onSearch,
        callback
      });
    }
  }
};
</script>

<style lang="scss">
.form-search-input {
  border: 1px solid rgb(229, 229, 229);
  border-radius: 4px;
  padding-left: 10px;
  height: 34px;
  overflow: hidden;

  &.disabled-input {
    border-color: rgb(229, 229, 229);
    background-color: rgb(238, 238, 238);
  }

  .form-search-input-icon {
    float: right;
    color: rgb(192, 196, 204) !important;
    font-size: 15px;
    margin-right: 5px;
  }
}
</style>
