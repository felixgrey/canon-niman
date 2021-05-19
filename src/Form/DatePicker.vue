<template>
	<view>
		<uni-datetime-picker type="date" :value="value" 
      :returnType="this.dataType" @change="v => $emit('change', v)"/>
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
    }
	}
</script>

<style>

</style>
