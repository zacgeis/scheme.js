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
            this.executeProc(call, args, frame, ret);
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
    executeProc: function(procval, args, frame, ret) {
      var argsDup = new SValue(args.type, args.value.slice());
      if(!procval.isMacro()) {
        _map(argsDup.value, function(node, mapret) {
          this.eval(node, frame, mapret);
        }.bind(this), function(evaled) {
          argsDup.value = evaled;
          argsDup.type = 'list';
          this._executeProc(procval, argsDup, frame, ret);
        }.bind(this));
      } else {
        this._executeProc(procval, args, frame, ret);
      }
    },
    _executeProc: function(procval, args, frame, ret) {
      var local = this.createFrame(procval.value, args, procval.value.closure || frame);
      local.set('__procname__', procval.value.name);
      var retProxy = function(value) {
        if(this.debug) {
          local.set('__retvalue__', result);
        }
        ret(value);
      };
      if(procval.isNative()) {
        procval.value.body.apply(null, [local, this, retProxy]);
      } else {
        this.eval(procval.value.body, local, retProxy);
      }
    },
    createFrame: function(proc, args, frame) {
      var local = frame.branch();
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
