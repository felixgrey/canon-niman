
/*$meta target=java;version=1*/

Select /*$ [@fields]*/a,s,d,v/*$eg.*/ from /*$=table*/aaa/*$eg.*/
where 1=1 

/*$if a [and as = @a] ## */
and as=123
/*$eg.*/

/*$if b [ and cc in (@b) ] */
and cc in (1,2,3)
/*$eg.*/


字符串 数组

[]里面是SQL
@渲染解构变量
@()是函数
##后面是注释
/*$eg.*/前面是注释


! || && == != >= <= > <

context.meta
context.tokens


start()
addString()
renderParam(context, field,)
end()

Sql.compiler.java={
  default: {
  
  },
}

if(){
  return 'if(' + + ')'
}






