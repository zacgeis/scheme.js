function initNatives(root) {
  root.set('-', new Func(['x', 'y'], function(context, evaluator) {
    return context.lookup('x') - context.lookup('y');
  }));
  root.set('*', new Func(['x', 'y'], function(context, evaluator) {
    return context.lookup('x') * context.lookup('y');
  }));
  root.set('+', new Func(['x', 'y'], function(context, evaluator) {
    return context.lookup('x') + context.lookup('y');
  }));
  root.set('>', new Func(['x', 'y'], function(context, evaluator) {
    return context.lookup('x') > context.lookup('y');
  }));
  root.set('<', new Func(['x', 'y'], function(context, evaluator) {
    return context.lookup('x') < context.lookup('y');
  }));
  root.set('=', new Func(['x', 'y'], function(context, evaluator) {
    return context.lookup('x') == context.lookup('y');
  }));

  root.set('define', new Macro(['arg', '.', 'body'], function(context, evaluator) {
    var arg = context.lookup('arg');
    var body = context.lookup('body');
    if(arg instanceof Expression) {
      var funcargs = arg.value.slice(1).map(function(token) {
        return token.value;
      });
      context.parent.set(arg.value[0].value, new Func(funcargs, body));
    } else {
      context.parent.set(arg.value, evaluator.eval(body[0], context.parent));
    }
    return context
  }));
  root.set('set!', new Macro(['varname', 'value'], function(context, evaluator) {
    var value = evaluator.eval(context.lookup('value'), context.parent);
    context.set(context.lookup('varname').value, value, true);
  }));
  root.set('if', new Macro(['cond', 'a', 'b'], function(context, evaluator) {
    if(evaluator.eval(context.lookup('cond'), context.parent)) {
      return evaluator.eval(context.lookup('a'), context.parent);
    }
    return evaluator.eval(context.lookup('b'), context.parent);
  }));
}

var Evaluator = (function() {
  function Evaluator() {
    this.global = new Context();
    initNatives(this.global);
  }
  Evaluator.prototype = {
    input: function(str) {
      var ast = Parser.parse(Lexer.lex(str));
      return this.eval(ast, this.global);
    },
    eval: function(node, context) {
      if(node instanceof Expression) {
        var car = node.car();
        var args = node.cdr();
        var wrapper = context.lookup(car.value);
        if(wrapper instanceof Func) {
          var evaledArgs = args.map(function(node) {
            return this.eval(node, context);
          }.bind(this));
          return this.apply(wrapper, evaledArgs, context);
        } else if(wrapper instanceof Macro) {
          var evaledArgs = args.map(function(node) {
            return node;
          }.bind(this));
          return this.apply(wrapper, evaledArgs, context);
        }
      } else if(node instanceof Token && node.type === 'variable') {
        return context.lookup(node.value);
      } else if(node instanceof Token) {
        return node.value;
      } else if(node instanceof Array) {
        var last;
        for(var i = 0; i < node.length; i++) {
          last = this.eval(node[i], context);
        }
        return last;
      }
      return null;
    },
    apply: function(wrapper, args, context) {
      var local = context.branch();
      for(var i = 0; i < wrapper.args.length; i++) {
        if(wrapper.args[i] === '.') {
          local.set(wrapper.args[i + 1], args.slice(i));
          break;
        }
        local.set(wrapper.args[i], args[i]);
      }
      if(wrapper.func instanceof Function) {
        return wrapper.func.apply(null, [local, this]);
      } else {
        return this.eval(wrapper.func, local);
      }
    }
  }
  return Evaluator;
}());
