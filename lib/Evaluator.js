var Evaluator = (function() {
  function Evaluator() {
    this.root = new Context();
    var exposedKeys = Object.keys(exposedNatives);
    for(var i = 0; i < exposedKeys.length; i++) {
      this.root.set(exposedKeys[i], exposedNatives[exposedKeys[i]]);
    }
  }
  Evaluator.prototype = {
    input: function(str, ret) {
      ret = ret || function() {};
      var ast = Parser.parse(Lexer.lex(str));
      this.eval(ast, this.root, ret);
    },
    eval: function(node, frame, ret) {
      if(node.isExpression()) {
        this.eval(node.value[0], frame, function(call) {
          if(call.isCallable()) {
            var args = new SValue('expression', node.value.slice(1));
            this.callProc(call, args, frame, ret);
          }
        }.bind(this));
      } else if(node.isVariable()) {
        var result = frame.resolve(node.value);
        if(result === null) {
          throw new Error('"' + node.value + '" not found');
        } else {
          ret(result);
        }
      } else if(node.isExpressionList()) {
        this.evalList(node.value, frame, function(result) {
          ret(result[result.length - 1]);
        });
      } else if (node.isCallable()) {
        if(node.isNative()) {
          node.value.body.apply(null, [frame, this]);
        } else {
          var callRet = frame.resolve('__ret__');
          this.eval(node.value.body, frame, callRet);
        }
      } else {
        ret(node);
      }
    },
    evalList: function(list, frame, ret) {
      if(list.length === 0) {
        ret([]);
      } else {
        this.eval(list[0], frame, function(val) {
          this.evalList(list.slice(1), frame, function(result) {
            ret([val].concat(result));
          }.bind(this));
        }.bind(this));
      }
    },
    callProc: function(procnode, args, frame, ret) {
      var local = frame.branch();
      local.set('__procname__', procnode.value.name);
      local.set('__ret__', ret);
      if(procnode.isMacro()) {
        this.applyArgs(procnode.value, args.value, local);
        local.include(procnode.value.closure);
        this.eval(procnode, local, ret);
      } else {
        this.evalList(args.value.slice(), frame, function(processedArgs) {
          this.applyArgs(procnode.value, processedArgs, local);
          local.include(procnode.value.closure);
          this.eval(procnode, local, ret);
        }.bind(this));
      }
    },
    applyArgs: function(proc, args, frame) {
      for(var i = 0; i < proc.argNames.length; i++) {
        if(proc.argNames[i] === '.') {
          frame.set(proc.argNames[i + 1], new SValue('list', args.slice(i)));
          break;
        }
        frame.set(proc.argNames[i], args[i]);
      }
    }
  };
  return Evaluator;
}());
