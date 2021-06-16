const {
  fromList,
  fromTree,
} = require('./../../src/Data/RelationAndTree.js');


// console.log(fromList, fromTree);


const tree = {
  id: 1,
  name: 'a1',
  children: [
    {
      id: 2,
      name: 'a2',
    },
    {
      id: 3,
      name: 'a3',
      children: [
        {
          id: 4,
          name: 'a4',
        },
      ]
    },
  ]
}

const tl = fromTree(tree);

// console.log(JSON.stringify(tl.list,null,2)   );

console.log(JSON.stringify(tl.tree,null,2)   );