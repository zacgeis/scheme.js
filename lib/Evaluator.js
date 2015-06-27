var Evaluator = (function() {
  function Evaluator() {
    this.root = new Context();
    var exposedKeys = Object.keys(exposedNatives);
    for(var i = 0; i < exposedKeys.length; i++) {
      this.root.set(exposedKeys[i], exposedNatives[exposedKeys[i]]);
    }
  }
  Evaluator.prototype = {
    input: function(str) {
      var ast = Parser.parse(Lexer.lex(str));
      return this.eval(ast, this.root);
    },
    eval: function(node, frame) {
      if(node.isExpression()) {
        var car = node.value[0];
        if(car.isVariable()) {
          var call = frame.resolve(car.value);
          if(call === null) {
            throw new Error('"' + car + '" not found');
          } else if(call.isCallable()) {
            var args = new SValue('expression', node.value.slice(1));
            return this.executeProc(call, args, frame);
          }
        }
      } else if(node.isVariable()) {
        return frame.resolve(node.value);
      } else {
        return node;
      }
    },
    executeProc: function(funcval, args, frame) {
      var argsDup = new SValue(args.type, args.value.slice());
      if(!funcval.isMacro()) {
        for(var i = 0; i < args.value.length; i++) {
          argsDup.value[i] = this.eval(args.value[i], frame);
        }
        argsDup.type = 'list';
      }
      var local = this.createFrame(funcval.value, argsDup, frame);
      if(funcval.isNative()) {
        return funcval.value.body.apply(null, [local, this]);
      } else {
        return this.eval(funcval.value.body, local);
      }
    },
    createFrame: function(func, args, frame) {
      var local = frame ? frame.branch() : new Context();
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
