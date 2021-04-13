const Agent = require('./../../src/Agent');

// console.log(Agent)

const model1 = {
  name: 'model1',
  value1: 1,
  value2: 2,
  
  child1: {
    name: 'child1',
  }
}

const agent1 = new Agent(model1);

agent1.$listen((data, info) => {
  console.log(data, info);
});

// agent1.newField = 'newField';

agent1.$watch({
  name: (v, info) => {
    agent1.name2 = agent1.name + '222'
  },
  name2:(v, info) => {
    agent1.name3 = agent1.name + '333'
  }
});

agent1.name = 'newName'

