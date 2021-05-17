<template>
	<view>
		<uni-datetime-picker type="date" :value="value" 
      :returnType="getReturnType()" @change="v => $emit('change', v)"/>
	</view>
</template>

<script>

	export default {
		name:"DatePicker",
    props:{
      value: {
        type: [String, Number],
        default: undefined
      },
      disabled: {
        type: Boolean,
        default: false
      },
      dataType: {
        type: String,
      },
      theExtend: {
        type: Object,
        default: () => ({})
      }
    },
		data() {
			return {};
		},
    methods:{
      getReturnType() {
        return this.dataType === 'number' ? 'timestamp': 'string';
      },
    }
	}
</script>

<style>

</style>
