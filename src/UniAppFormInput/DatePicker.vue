<template>
	<view>
		<uni-datetime-picker :key="pickerKey"
      :type="inputType" :value="value" 
      :returnType="dataType" @change="v => $emit('change', v)"/>
	</view>
</template>

<script>
  
  const keySeed = 'date-time-' + Date.now();
  let keyIndex = 1;

	export default {

		name:"DatePicker",
    props:{
      value: {
        type: [String, Number, Array],
        default: undefined
      },
      disabled: {
        type: Boolean,
        default: false
      },
      dataType: {
        type: String,
      },
      valueIsArray: {
        type: Boolean,
        default: false
      },
      theExtend: {
        type: Object,
        default: () => ({})
      }
    },
		data() {
      
			return {
        pickerKey: `${keySeed}-${keyIndex++}`,
        theValue: this.value,
      };
		},
    updated() {
      // 解决组件不能置空问题
      if (this.value === undefined && !this.newPiecker) {
        this.pickerKey = `${keySeed}-${keyIndex++}`;
        this.newPiecker = true;
      } 
      
      if (this.value !== undefined) {
        this.newPiecker = false;
      }
    },
    computed:{
      inputType() {
        let {
          type = 'date'
        } = this.theExtend;
        return type;
      },
    },
    methods:{
    }
	}
</script>

<style>

</style>
