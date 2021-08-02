[](https://www.npmjs.com/package/watchpack)


/*# 
{
  operator
}
#*/

/*~ 
file
~*/


== != > < >= <= () && || ! ,

if
else 
for 
...(Array,Map,Pojo)



/*@name*/ code /*@*/

====================================

/*#name {} #/ 锚点或配置


/*@name*/ code /*@*/代码块

代码块内
/*: if (){ :*/


/*: } :*/

/*:=value*/ 输出值

/*eg:*/ example code /*:eg*/

====================================

/*#meta
{
  operator: 'businessPageBuilder',
  name: 'aaa',
  sqlType: ['mybatis','javacode']
}
#*/

xxx.build.js

/*#request*/
{
  'name': {
    url: ''
    method: '',
    requestFields: [
      
    ],
    responseFields: [
      
    ],
    pagination: {
      size: 10,
    }
  }
}  
/*#*/

params
result

/*$params = 'a' : String *$/
/*@import@*/

/*@sql*/
  select /*...$result*/ from aaa 
  
  where '1' == '1' 
  
  /*: if ($param.a) { :*/
    and col1=/*=$param.a=*//*<*/ 'aaa' /*>*/
  /*:}:*/
  
/*@*/
-------------------------------------




const {
  If flag ,ElsIf flag,  Else, For IteratorAble, Each IteratorAble
} = require('logicElements')

require

const declare = {
  meta: {
    type: 'page',
  },
  controler: {
    requestName: {
      url: ''
      method: '',
      requestFields: [
        
      ],
      responseFields: [
        
      ],
      pagination: {
        size: 10,
      }
    }
  },
  sql: {
    requestName() {
      
    }
  }
}

buildCode({});



----------------------------------
state

action

reducer

map