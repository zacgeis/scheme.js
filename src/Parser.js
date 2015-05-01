var Parser = (function() {
  function Parser() {
    this.s = [];
    this.cn = null;
  }
  Parser.prototype = {
    parse: function(tokens) {
      this.s = [];
      this.cn = this.s;
      for(var i = 0; i < tokens.length; i++) {
        var t = tokens[i];
        if(t === '(') {
          var bl = [];
          this.cn.push(this.cn = bl);
          this.s.push(this.cn);
        } else if(t === ')') {
          this.s.pop();
          this.cn = this.s[this.s.length-1];
        } else {
          this.cn.push(t);
        }
      }
      return this.s[0];
    }
  }
  return new Parser();
}());
