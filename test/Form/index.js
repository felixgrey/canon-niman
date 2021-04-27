const FormModel = require('./../../src/Form/FormModel');
/*

if (true) {
  
}

*/

const fields = [
  {
    field: 'name',
    label: '姓名',
    required: true,
  },
  {
    field: 'age',
    label: '年龄',
    initValue: 99,
    rule: v => (v < 0 ? '年龄不能为负' : null),
  },
  {
    field: 'sex',
    label: '性别',
  },
];

if (false) {
  const form = new FormModel(fields,{
    initData: {
      name: '张三',
    }
  });
  
  form.startRender();
  
  const fieldParam = form.withField('name');
  console.log(fieldParam);
  
  form.withField('name');
  console.log(form.getRenderedFields());
  
  form.withField('age');
  console.log(form.getRenderedFields())
  console.log(form.withField('age'));
  
  fieldParam.props.onChange('李四');
  console.log(form.getFormData(), form.withField('name'));
  
  console.log(form.withField('a'));
}

if (false) {
  const form = new FormModel(fields,{
    initData: {
      name: '张三',
    },
    onFormChange: function(){console.log('发生变化')} 
  });
  
  // console.log(form.onFormChange.toString());
  
  // const fieldParam = form.withField('age');
  // console.log(fieldParam);
  
  // console.log(form.withField('name'));
  
  // form.withField('name').props.onChange('李四');
  
  form.withField('name').props.onChange(null);
  form.checkFormData().then(result => {
    console.log(result, form.withField('name'));
    form.withField('name').props.onFocus();
    console.log(form.withField('name'));
  })
 
}

if (true) {
  const form = new FormModel(fields,{
    initData: {
      name: '张三',
    }
  });
  
  form.withField('age');
  form.setFieldsValue({sex: '男', some: 999});
  
  console.log(form.getFormData());
  
}
