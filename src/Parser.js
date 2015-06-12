var Parser = (function() {
  function Parser() {
    this.root = new Expression();
    this.current = this.root;
    this.history = [];
  }
  Parser.prototype = {
    parse: function(tokens) {
      Parser.call(this);
      for(var i = 0; i < tokens.length; i++) {
        var token = tokens[i];
        if(token.type === 'delimiter' && token.value === '(') {
          var next = new Expression();
          this.current.value.push(next);
          this.history.push(this.current);
          this.current = next;
        } else if(token.type === 'delimiter' && token.value === ')') {
          this.current = this.history.pop();
        } else {
          this.current.value.push(token);
        }
      }
      return this.root.value;
    }
  }
  return new Parser();
}());
