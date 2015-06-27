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
        if(_car(node).isKeyword()) {
          var call = context.lookup(_car(node).value);
          var args = _cdr(node);
          if(call === null) {
            throw new Error('"' + _car(node).value + '" not found');
          } if(call.isCallable()) {
            return this.apply(call, args, context);
          } else {
            return call;
          }
        } else if(_car(node).isExpression()) {
          var result = this.eval(_car(node), context);
          if(!_cdr(node).isNull()) {
            result = this.eval(_cdr(node), context);
          }
          return result;
        } else {
          return _car(node);
        }
      } else if(node.isKeyword()) {
        return context.lookup(node.value);
      } else {
        return node;
      }
    },
    apply: function(funcval, args, context) {
      if(funcval.isFunction()) { // not macro.
        for(var i = 0; i < args.value.length; i++) {
          args.value[i] = this.eval(args.value[i], context);
        }
      }
      var local = createFrame(funcval.value, args, context);
      if(funcval.isNative()) {
        return funcval.value.body.apply(null, [local, this]);
      } else {
        return this.eval(funcval.value.body, local);
      }
    }
  }
  return Evaluator;
}());
