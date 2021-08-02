class Compiler {
  constructor() {
    this.context = {};
  }

  getFirstCharIndex(token = [], start, char) {
    for (let i = start; i < token.length; i++) {
      if (token[i] === char) {
        return i;
      }
    }
    return -1;
  }

  keyWords = {
    if: (token, i, context) => {
      const parent = context.currentNode;
      
      const {
        pushField = 'children',
      } = parent;

      if (parent.type === 'expression') {
        throw new Error(`Syntax Error`);
      }

      const node = {
        type: 'process',
        value: 'if',
        parent,
        expression: [],
        children: [],
        pushField: 'expression'
      };

      this.pushChildNode(parent, node);
      context.currentNode = node;

      const start1 = this.getFirstCharIndex(token, index, '(');
      const end1 = this.getCodeBlock(token, start1);
      const token1 = token.slice(start1 + 1, end1);

      this.ast(node, token1, context);

      const start2 = this.getFirstCharIndex(token, index, '{');
      const end2 = this.getCodeBlock(token, start2);
      const token2 = token.slice(start2, end2);
      this.ast(node, token2.context);

      context.currentNode = parent;

      return end2 + 1;
    },
    'equal': (word, index, token, context) => {
      const parent = context.currentNode;
      
      const {
        pushField = 'children',
      } = parent;
        
      const node = {
        type: 'expression',
        value: '=='
      }

      this.pushChildNode(parent, node);  
      
      return token.length + 1;
    }
  }
  
  pushChildNode(node, childNode) {
    childNode.parent = node;
    childNode.children = childNode.children || [];
    node[node.pushField ? node.pushField : 'children'].push(childNode);
  }

  getCodeBlock(token, start) {
    let count1 = 0; // ();
    let count2 = 0; // [];
    let count3 = 0; // {};

    for (let i = start; i < token.length; i++) {
      const value = token[i].trim();

      if (value === '(') {
        count1++;
      } else if (token[i] === ')') {
        count1--;
      }

      if (value === '[') {
        count2++;
      } else if (value === ']') {
        count2--;
      }

      if (value === '{') {
        count3++;
      } else if (value === '}') {
        count3--;
      }

      if (count1 === 0 && count2 === 0 && count3 === 0) {
        return i;
      }
    }

    return -1;
  }

  sentence(word, index, token, context) {

    this.pushChildNode(context.currentNode, {
      type: 'sentence',
      value: null,
      expression: [],
      children: [],
      text: word,
    });
  }

  parse(code = '') {

    code = code
      .replace(/\(/g, ' ( ')
      .replace(/\)/g, ' ) ')
      .replace(/\[/g, ' [ ')
      .replace(/\]/g, ' ] ')
      .replace(/\{/g, ' { ')
      .replace(/\}/g, ' } ');

    for (let key in this.keyWords) {
      code = code.replace(new RegExp(key, 'g'), ` ${key} `);
    }

    const token = code.trim().replace(/\s+/g, ' ').split(' ');

    const context = {
      ...this.context,
      currentNode: {
        type: 'root',
        value: null,
        parent: null,
        expression: [],
        children: [],
      },
      token,
    };

    this.ast(context.currentNode, token, context);

    return context;
  }

  ast(node, token = [], context) {
    token = [].concat(token);

    for (let i = 0; i < token.length;) {
      const word = token[i];
      const args = [token, i, context];

      if (this.keyWords[word]) {
        i = this.keyWords[word](...args);
      } else {
        i = this.sentence(...args);
      }
    }
  }
}

module.exports = Compiler;
