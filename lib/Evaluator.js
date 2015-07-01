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
      } else {
        ret(node);
      }
    },
    callProc: function(procval, args, frame, ret) {
      this.processArgs(procval, args, frame, function(processedArgs) {
        var local = this.createFrame(procval.value, processedArgs, procval.value.closure || frame);
        if(procval.isNative()) {
          procval.value.body.apply(null, [local, this, ret]);
        } else {
          this.eval(procval.value.body, local, ret);
        }
      }.bind(this));
    },
    processArgs: function(procval, args, frame, ret) {
      var argsDup = new SValue(args.type, args.value.slice());
      if(!procval.isMacro()) {
        _map(argsDup.value, function(node, mapRet) {
          this.eval(node, frame, mapRet);
        }.bind(this), function(evaled) {
          argsDup.value = evaled;
          argsDup.type = 'list';
          ret(argsDup);
        }.bind(this));
      } else {
        ret(args);
      }
    },
    createFrame: function(proc, args, frame) {
      var local = frame.branch();
      local.set('__procname__', proc.name);
      for(var i = 0; i < proc.argNames.length; i++) {
        if(proc.argNames[i] === '.') {
          local.set(proc.argNames[i + 1], new SValue('list', args.value.slice(i)));
          break;
        }
        local.set(proc.argNames[i], args.value[i]);
      }
      return local;
    }
  };
  return Evaluator;
}());
