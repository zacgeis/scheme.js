var Evaluator = (function() {
  function Evaluator() {
    this.global = new Context();
    var exposedKeys = Object.keys(exposedNatives);
    for(var i = 0; i < exposedKeys.length; i++) {
      this.global.set(exposedKeys[i], exposedNatives[exposedKeys[i]]);
    }
  }
  Evaluator.prototype = {
    input: function(str) {
      var ast = Parser.parse(Lexer.lex(str));
      return this.eval(ast, this.global);
    },
    eval: function(node, context) {
      if(node.isExpression()) {
        var car = node.value[0];
        if(car.isKeyword()) {
          var call = context.lookup(car.value);
          if(call === null) {
            throw new Error('"' + car + '" not found');
          } else if(call.isCallable()) {
            var args = new SValue('expression', node.value.slice(1));
            return this.executeProc(call, args, context);
          }
        }
      } else if(node.isKeyword()) {
        return context.lookup(node.value);
      } else {
        return node;
      }
    },
    executeProc: function(funcval, args, context) {
      var argsDup = new SValue(args.type, args.value.slice());
      if(funcval.isFunction()) {
        for(var i = 0; i < args.value.length; i++) {
          argsDup.value[i] = this.eval(args.value[i], context);
        }
        argsDup.type = 'list';
      }
      var local = this.createFrame(funcval.value, argsDup, context);
      if(funcval.isNative()) {
        return funcval.value.body.apply(null, [local, this]);
      } else {
        return this.eval(funcval.value.body, local);
      }
    },
    createFrame: function(func, args, context) {
      var local = context ? context.branch() : new Context();
      for(var i = 0; i < func.argNames.length; i++) {
        if(func.argNames[i] === '.') {
          local.set(func.argNames[i + 1], new SValue('list', args.value.slice(i)));
          break;
        }
        local.set(func.argNames[i], args.value[i]);
      }
      return local;
    }
  };
  return Evaluator;
}());
