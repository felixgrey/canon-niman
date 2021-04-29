易学易用、见缝插针的大杂烩




格式约定

数据定义
{
  field: 字段名
  value: 字段值
  label: 字段标签
  desc: 字段描述
  dataType: 数据类型
  required: 必填
  initValue: 初始值
  defaultValue: 默认值
}

数据状态
{
  isNew
  isInit
  isSelected
  isLocked
  isModified
  isDeleted
  isDisabled
  
  originValue
}

字段选择 XXXField格式
{
 labelField
 valueField 
}

待选择数据、展示数据
{
  data Object/Array
}

数据绑定
{
  value
  onChange(value)
}


