var count = 0;

var Evaluator = (function() {
  function Evaluator() {
    this.root = new Context();
    this.maximumStackDepth = 100;
    var exposedKeys = Object.keys(exposedNatives);
    for(var i = 0; i < exposedKeys.length; i++) {
      this.root.set(exposedKeys[i], exposedNatives[exposedKeys[i]]);
    }
  }
  Evaluator.prototype = {
    input: function(str, ret) {
      var ast = Parser.parse(Lexer.lex(str));
      var ret = ret || function() {};
      this.eval(ast, this.root, ret);
    },
    eval: function(node, frame, ret) {
      if(node.isArray()) {
        if(node.value.length === 1) {
          this.eval(node.value[0], frame, ret);
          //ret(new SValue('list', []));
        } else {
          this.eval(node.value[0], frame, function(val) {
            this.eval(new SValue('array', node.value.slice(1)), frame, function(result) {
              result.value = [val].concat(result.value);
              console.log(ret);
              ret(result);
            }.bind(this));
          }.bind(this));
        }
      } else if(node.isExpression()) {
        this.eval(node.value[0], frame, function(call) {
          //console.log(node.value[0]);
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
          //console.log(node.value);
          ret(result);
        }
      } else {
        ret(node);
      }
    },
    callProc: function(procval, args, frame, ret) {
      //console.log('process arg start', count++);
      if(frame.depth >= this.maximumStackDepth) {
        throw new Error('maximum stack depth of ' + this.maximumStackDepth + ' exceeded');
      }
      //console.log(procval.value.name + ' called')

      var isTailCall = frame.resolve('__procname__') === procval.value.name;
      // var isTailCall = options.isTailCall;
      //console.log(frame.resolve('__procname__') + ' ' + procval.value.name + ' ' + isTailCall);
      var newframe;
      if(isTailCall) {
        newframe = frame;
        //console.log('isTailCall');
      } else {
        newframe = frame.branch();
        //console.log('isNotTail');
        //console.log('ret', ret, frame);
        newframe.set('__ret__', ret);
        newframe.include(procval.value.closure);
        newframe.set('__procname__', procval.value.name);
      }

      this.processArgs(procval, args, newframe, function(processedArgs) {
        processedArgs.type = 'list';
        var local = this.applyArgs(procval.value, processedArgs, newframe);
        //console.log('process arg finish', count--);
        if(processedArgs.value.length === 1) {
          newframe.set('__ret__', frame.resolve('__ret__'));
        }

        if(procval.isNative()) {
          procval.value.body.apply(null, [local, this]);
        } else {
          var ret = local.resolve('__ret__');
          this.eval(procval.value.body, local, ret);
        }
      }.bind(this), isTailCall);
    },
    processArgs: function(procval, args, frame, ret) {
      var argsDup = new SValue('array', args.value.slice());
      if(!procval.isMacro()) {
        this.eval(argsDup, frame, ret);
      } else {
        ret(args);
      }
    },
    applyArgs: function(proc, args, local) {
      if(args.length === undefined) {
        local.set(proc.argNames[0], args.value[0]);
        return local;
      }
      for(var i = 0; i < proc.argNames.length; i++) {
        var argName = proc.argNames[i];
        var value = args.value[i];
        if(argName === undefined || value === undefined) {
          throw new Error('"' + proc.name + '" called with ' + args.value.length + ' arguments but expected ' + proc.argNames.length);
        }
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
