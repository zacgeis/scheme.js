var Lexer = (function() {
  function Lexer() {
    this.tokens = [];
    this.buffer = '';
    this.stringLiteral = false;
  }
  Lexer.prototype = {
    _pushToken: function(str) {
      var token = null;
      if(/-?(?:0|[1-9]\d*)(?:\.\d+)?(?:[eE][+-]?\d+)?/.test(str)) {
        token = new Token('number', str);
      } else if(/#t|#f/.test(str)) {
        token = new Token('boolean', str);
      } else if(str === '(' || str === ')' || str === ' ') {
        token = new Token('delimiter', str);
      } else if(/"(.*)"/.test(str)) {
        token = new Token('string', str.match(/"(.*)"/)[1]);
      } else if(str === '\'') {
        token = new Token('delimiter', '\'');
      } else if(str.indexOf('\'') === 0) {
        token = new Token('string', str.slice(1));
      } else {
        token = new Token('variable', str);
      }
      this.tokens.push(token);
    },
    _pushBuffer: function() {
      if(this.buffer.length > 0) {
        this._pushToken(this.buffer);
        this.buffer = '';
      }
    },
    lex: function(input) {
      Lexer.call(this);
      for(var i = 0; i < input.length; i++) {
        var char = input[i];
        if(!this.stringLiteral && (char === '(' || char === ')' || char === ' ')) {
          this._pushBuffer();
          this._pushToken(char);
        } else if(char === '"') {
          this.buffer += char;
          if(this.stringLiteral) {
            this._pushBuffer();
          }
          this.stringLiteral = !this.stringLiteral;
        } else {
          this.buffer += char;
        }
      }
      this._pushBuffer();
      return this.tokens.filter(function(token) {
        return !(token.type === 'delimiter' && token.value === ' ');
      });
    }
  };
  return new Lexer();
}());
