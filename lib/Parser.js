var Parser = (function() {
  function Parser() {
    this.root = new SValue('expression', [new SValue('keyword', 'begin')]);
    this.current = this.root;
    this.history = [];
    this.listLiteral = false;
  }
  Parser.prototype = {
    parse: function(tokens) {
      Parser.call(this);
      for(var i = 0; i < tokens.length; i++) {
        var token = tokens[i];
        if(token.type === 'delimiter' && token.value === '\'') {
          this.listLiteral = true;
        } else if(token.type === 'delimiter' && token.value === '(') {
          var next = new SValue(this.listLiteral ? 'list' : 'expression', []);
          this.current.value.push(next);
          this.history.push(this.current);
          this.current = next;
        } else if(token.type === 'delimiter' && token.value === ')') {
          this.listLiteral = false;
          this.current = this.history.pop();
        } else if(token.type === 'string') {
          this.current.value.push(new SValue('string', String(token.value)));
        } else if(token.type === 'number') {
          this.current.value.push(new SValue('number', Number(token.value)));
        } else if(token.type === 'boolean') {
          this.current.value.push(new SValue('boolean', token.value === '#t'));
        } else {
          this.current.value.push(new SValue('keyword', token.value));
        }
      }
      return this.root;
    }
  };
  return new Parser();
}());
