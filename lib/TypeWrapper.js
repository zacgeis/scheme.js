function Token(type, value) {
  this.type = type;
  this.value = value;
}

function SicpValue(type, value) {
  this.type = type;
  this.value = value;
}
SicpValue.prototype = {
  isAny: function() {
    return true;
  },
  isList: function() {
    return this.type === 'list' || this.isExpression();
  },
  isExpression: function() {
    return this.type === 'expression';
  },
  isString: function() {
    return this.type === 'string';
  },
  isBoolean: function() {
    return this.type === 'boolean';
  },
  isNumber: function() {
    return this.type === 'number';
  },
  isKeyword: function() {
    return this.type === 'keyword';
  },
  isCallable: function() {
    return this.isFunction() || this.isMacro();
  },
  isFunction: function() {
    return this.type === 'function' || this.isNativeFunction();
  },
  isMacro: function() {
    return this.type === 'macro' || this.isNativeMacro();
  },
  isNativeMacro: function() {
    return this.type === 'native-macro';
  },
  isNativeFunction: function() {
    return this.type === 'native-function';
  },
  isNative: function() {
    return this.isNativeMacro() || this.isNativeFunction();
  },
  isNull: function() {
    if(this.isList() && this.value.length === 0) {
      return true;
    }
    if(this.type === 'null') {
      return true;
    }
    return false;
  }
};
SicpValue.prototype.NULL = new SicpValue('null', null);

function SicpFunc(name, argNames, argTypes, returnType, body) {
  this.name = name;
  this.argNames = argNames;
  this.argTypes = argTypes;
  this.returnType = returnType;
  this.body = body;
}

var exposedNatives = {};
function createFrame(func, args, context) {
  var local = context ? context.branch() : new Context();
  for(var i = 0; i < func.argNames.length; i++) {
    if(func.argNames[i] === '.') {
      local.set(func.argNames[i + 1], new SicpValue('list', args.value.slice(i)));
      break;
    }
    local.set(func.argNames[i], args.value[i]);
  }
  return local;
}
function callProxy(val, args, evaluator) {
  var func = val.value;
  var frame = createFrame(func, new SicpValue('list', args));
  return func.body.apply(null, [frame, evaluator]);
}
function defineFunc(name, argNames, argTypes, returnType, nativeFunc) {
  var newfunc = new SicpFunc(name, argNames, argTypes, returnType, nativeFunc);
  var newval = new SicpValue('native-function', newfunc);
  exposedNatives[name] = newval;
  return newval;
}
function defineMacro(name, argNames, argTypes, returnType, nativeFunc) {
  var newfunc = new SicpFunc(name, argNames, argTypes, returnType, nativeFunc);
  var newval = new SicpValue('native-macro', newfunc);
  exposedNatives[name] = newval;
  return newval;
}

defineFunc('>', ['x', 'y'], ['number', 'number'], 'boolean', function(context, evaluator) {
  return new SicpValue('boolean', context.lookup('x').value > context.lookup('y').value);
});
defineFunc('<', ['x', 'y'], ['number', 'number'], 'boolean', function(context, evaluator) {
  return new SicpValue('boolean', context.lookup('x').value < context.lookup('y').value);
});
defineFunc('=', ['x', 'y'], ['number', 'number'], 'boolean', function(context, evaluator) {
  return new SicpValue('boolean', context.lookup('x').value == context.lookup('y').value);
});
defineFunc('+', ['x', 'y'], ['number', 'number'], 'number', function(context) {
  var x = context.lookup('x').value;
  var y = context.lookup('y').value;
  return new SicpValue('number', x + y);
});
defineFunc('-', ['x', 'y'], ['number', 'number'], 'number', function(context) {
  var x = context.lookup('x').value;
  var y = context.lookup('y').value;
  return new SicpValue('number', x - y);
});
defineFunc('*', ['x', 'y'], ['number', 'number'], 'number', function(context) {
  var x = context.lookup('x').value;
  var y = context.lookup('y').value;
  return new SicpValue('number', x * y);
});
defineFunc('/', ['x', 'y'], ['number', 'number'], 'number', function(context) {
  var x = context.lookup('x').value;
  var y = context.lookup('y').value;
  return new SicpValue('number', x / y);
});
defineFunc('cons', ['a', 'b'], ['any', 'any'], 'list', function(context, evaluator) {
  return new SicpValue('list', [context.lookup('a'), context.lookup('b')]);
});
var append = defineFunc('append', ['target', 'value'], ['list', 'any'], 'list', function(context) {
  var target = context.lookup('target');
  var value = context.lookup('value');
  var result = target.value.slice();
  result.push(value);
  return new SicpValue(target.type, result);
});
var car = defineFunc('car', ['target'], ['list'], 'any', function(context) {
  var target = context.lookup('target');
  return target.value[0];
});
var cdr = defineFunc('cdr', ['target'], ['list'], 'list', function(context) {
  var target = context.lookup('target');
  return new SicpValue(target.type, target.value.slice(1));
});

defineMacro('if', ['cond', 'a', 'b'], ['expression', 'any', 'any'], 'any', function(context, evaluator) {
  if(evaluator.eval(context.lookup('cond'), context.parent).value) {
    return evaluator.eval(context.lookup('a'), context.parent);
  } else {
    return evaluator.eval(context.lookup('b'), context.parent);
  }
});

defineMacro('define', ['arg', '.', 'body'], ['any', 'any'], 'null', function(context, evaluator) {
  var arg = context.lookup('arg');
  var body = context.lookup('body');
  body.type = 'expression';
  if(arg.isExpression()) {
    var funcargs = arg.value.slice(1).map(function(val) {
      return val.value;
    });
    var newfunc = new SicpFunc(name, funcargs, [], '', body);
    var newval = new SicpValue('function', newfunc);
    context.parent.set(arg.value[0].value, newval);
  } else {
    context.parent.set(arg.value, evaluator.eval(body, context.parent));
  }
  return SicpValue.NULL;
});

defineMacro('set!', ['name', 'value'], ['keyword', 'any'], 'null', function(context, evaluator) {
  var value = evaluator.eval(context.lookup('value'), context.parent);
  context.set(context.lookup('name').value, value, true);
  return SicpValue.NULL;
});


defineMacro('eval', ['body'], ['expression'], 'null', function(context, evaluator) {
  var body = context.lookup('body');
  body.type = 'expression';
  return evaluator.eval(body, context.parent);
});

defineMacro('let', ['arg', '.', 'body'], ['any'], 'null', function(context, evaluator) {
  var arg = context.lookup('arg');
  var body = context.lookup('body');
  body.type = 'expression';
  arg = arg.value.map(function(token) {
    var name = token.value[0].value;
    var value = token.value[1];
    context.set(name, value);
  });
  return evaluator.eval(body, context);
});

defineMacro('lambda', ['arg', '.', 'body'], ['any'], 'any', function(context, evaluator) {
  var arg = context.lookup('arg');
  var body = context.lookup('body');
  body.type = 'expression';
  arg = arg.value.map(function(token) {
    return token.value;
  });
  var newfunc = new SicpFunc('anonymous', arg, [], '', body);
  var newval = new SicpValue('function', newfunc);
  return newval;
});

var _car = function(target) {
  return callProxy(car, [target]);
};
var _cdr = function(target) {
  return callProxy(cdr, [target]);
};
