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

String Number Boolean Array Dict Function Any

/*: if ($a,$$global) { :*/
/*=... =*/

/*<*/ example code /*>*/

/*@name*/ code /*@*/

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