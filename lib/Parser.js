var Parser = (function() {
  function Parser() {
    this.root = new SicpValue('expression', []);
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
          var next = new SicpValue(this.listLiteral ? 'list' : 'expression', []);
          this.current.value.push(next);
          this.history.push(this.current);
          this.current = next;
        } else if(token.type === 'delimiter' && token.value === ')') {
          this.listLiteral = false;
          this.current = this.history.pop();
        } else if(token.type === 'string') {
          this.current.value.push(new SicpValue('string', String(token.value)));
        } else if(token.type === 'number') {
          this.current.value.push(new SicpValue('number', Number(token.value)));
        } else if(token.type === 'boolean') {
          this.current.value.push(new SicpValue('boolean', token.value === '#t'));
        } else {
          this.current.value.push(new SicpValue('keyword', token.value));
        }
      }
      return this.root;
    }
  };
  return new Parser();
}());
