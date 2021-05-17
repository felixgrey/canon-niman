<template>
	<view class="form-item-select">
		<picker @change="changeSelect" mode="selector"
      :value="selectedIndex" :range="formattedData" >
			<view class="form-item-input-label">
        {{formattedData[selectedIndex]}}
        <uni-icons class="form-search-input-icon" type="arrowdown"></uni-icons>
      </view>
		</picker>
	</view>
</template>

<script>
	export default {
		name:"Select",
    props: {
      value: {
        type: [String, Number],
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
			return {};
		},
    computed: {
      selectedIndex() {
        return this.getSelectIndex(this.value);
      },
      formattedData() {
        const {
          data = [],
          labelField = 'label',
        } = this.theExtend;
        return data.map(item => item[labelField])
      },
      
    },
    methods:{
      getSelectIndex(value) {
        const {
          data = [],
          valueField = 'value',
        } = this.theExtend;
        
        const index = data.map(item => item[valueField]).indexOf(value);
        if (index === -1) {
          return null;
        }
        return index;
      },
      changeSelect(e) {
        const {
          data = [],
          valueField = 'value',
        } = this.theExtend;
        
        const index = e.target.value;
        this.$emit('change', data[index][valueField]);
      },
    }
	}
</script>

<style lang="scss">
  .form-item-select{
    .form-item-input-label{
      height: 32px;
      line-height: 32px;
      border: solid 1px rgb(229, 229, 229);
      padding-left: 10px;
    }
    
    .form-search-input-icon {
      float: right;
      color: rgb(192, 196, 204) !important;
      font-size: 15px;
      margin-right: 5px;
    }
  }
</style>
