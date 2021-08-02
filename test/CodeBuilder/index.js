const fs = require("fs");
const Compiler =  require('../../src/CodeBuilder/Compiler/index.js');

const testSourceCode1 = fs.readFileSync('./testSourceCode1.spt','utf-8');



const compiler = new Compiler();
const context = compiler.parse(testSourceCode1);

console.log(JSON.stringify(context.currentNode, (key, value) => {
  if (key !== 'parent') {
    return value;
  }
}, 2));


