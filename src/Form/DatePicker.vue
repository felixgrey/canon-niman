<template>
	<view>
		<uni-datetime-picker :type="type" :value="value" 
      :returnType="this.dataType" @change="v => $emit('change', v)"/>
	</view>
</template>

<script>

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
      theExtend: {
        type: Object,
        default: () => ({})
      }
    },
		data() {
			return {};
		},
    computed:{
      type() {
        let {
          type = 'date'
        } = this.theExtend;
        return type;
      }
    },
    methods:{
    }
	}
</script>

<style>

</style>
