var Evaluator = (function() {
  function Expression(ps, ns) {
    this.ps = ps;
    this.ns = ns;
  }
  function Evaluator() {
    this.root = new Environment();
    this.root.set('+', function() {
      return Array.prototype.reduce.call(arguments, function(a, b) {return a + b});
    });
    this.root.set('-', function() {
      return Array.prototype.reduce.call(arguments, function(a, b) {return a - b});
    });
    this.root.set('*', function() {
      return Array.prototype.reduce.call(arguments, function(a, b) {return a * b});
    });
    this.root.set('alert', function() {
      alert(arguments);
      return null;
    });
    this.root.setS('begin', function() {
      return Array.prototype.map.call(arguments, function(node) {return this.ev.eval(node, this.env)}.bind(this)).pop();
    });
    this.root.setS('set!', function(key, val) {
      this.env.set(key, val, true);
      return null;
    });
    this.root.setS('define', function() {
      var k = arguments[0];
      if(k instanceof Array) {
        var body = Array.prototype.slice.call(arguments, 1);
        var params = Array.prototype.slice.call(k, 1);
        var exp = new Expression(params, body);
        this.env.set(k[0], exp, true);
      } else {
        var v = arguments[1];
        this.env.set(k, v, true);
        return null;
      }
    });
    this.root.set('#t', true);
    this.root.set('#f', false);
    this.root.set('>', function(a, b) {
      return a > b;
    });
    this.root.set('<', function(a, b) {
      return a < b;
    });
    this.root.set('=', function(a, b) {
      return a == b;
    });
    this.root.setS('if', function(cond, ift, iff) {
      if(this.ev.eval(cond, this.env)) {
        return this.ev.eval(ift, this.env);
      } else {
        return this.ev.eval(iff, this.env);
      }
    });
  }
  Evaluator.prototype = {
    main: function(input) {
      var ast = Parser.parse(Lexer.lex(input));
      return this.eval(ast, this.root);
    },
    eval: function(node, env) {
      if(typeof node === 'string') return env.resolve(node);
      if(!(node instanceof Array)) return node;
      var car = node[0];
      node = node.slice(1);
      var f = this.root.resolve(car);
      if(f.s !== true) {
        node = node.map(function(t) {
          if(t instanceof Array) {
            return this.eval(t, env);
          }
          if(typeof t === 'string') {
            return env.resolve(t);
          }
          return t;
        }.bind(this));
      }
      return this.apply(f, node, env);
    },
    apply: function(f, args, env) {
      if(typeof f === 'function') {
        return f.apply({env: env, ev: this}, args);
      } else if(f instanceof Expression) {
        var local = env.branch();
        for(var i = 0; i < f.ps.length; i++) {
          local.set(f.ps[i], args[i]);
        }
        return env.resolve('begin').apply({env: local, ev: this}, f.ns);
      }
    }
  }
  return new Evaluator();
}());
