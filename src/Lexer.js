var Lexer = (function() {
  function Lexer() {
    this.t = [];
    this.b = '';
  }
  Lexer.prototype = {
    _cas: function(c) {
      if(/-?(?:0|[1-9]\d*)(?:\.\d+)?(?:[eE][+-]?\d+)?/.test(c)) {
        return Number(c);
      }
      return c;
    },
    _cap: function(c) {
      this.b !== '' && this.t.push(this._cas(this.b));
      c && c!== '' && this.t.push(this._cas(c));
      this.b = '';
    },
    lex: function(input) {
      this.t = [];
      this.b = '';
      for(var i = 0; i < input.length; i++) {
        var c = input[i];
        if(c === ' ') {
          this._cap();
        } else if(c === '(' || c === ')') {
          this._cap(c);
        } else {
          this.b += c;
        }
      }
      return this.t;
    }
  }
  return new Lexer();
}());
