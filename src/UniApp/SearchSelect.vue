<template>
  <view @click="openSearchPage">
    <text>{{ getLabel() }}</text>
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
      data,
      muti,
      placeholder,
      recordValue,
      onSearch,
      data,
      decodeMap
    };
  },
  methods: {
    getLabel() {
      if(this.myValue === undefined || this.myValue === null) {
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
      const { labelField, valueField, data, muti, placeholder, recordValue, onSearch } = this;

      const callback = this.recordValue
        ? item => {
            this.myValue = item;
            this.$emit('change', this.myValue);
          }
        : item => {
            this.myValue = item[valueField];
            this.$emit('change', this.myValue);
          };
          
      const value = this.recordValue ? this.value[this.valueField] : this.value;
          
      this.$$openSearchPage({
        labelField,
        valueField,
        data,
        value,
        muti,
        placeholder,
        onSearch,
        callback,
      });
    }
  }
};
</script>

<style></style>
