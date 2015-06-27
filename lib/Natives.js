var exposedNatives = {};
function _listToBegin(val) {
  return new SValue('expression', [new SValue('keyword', 'begin')].concat(val.value));
}
function defineFunc(name, argNames, argTypes, returnType, nativeFunc) {
  var newfunc = new SProc(name, argNames, argTypes, returnType, nativeFunc);
  var newval = new SValue('native-function', newfunc);
  exposedNatives[name] = newval;
}
function defineMacro(name, argNames, argTypes, returnType, nativeFunc) {
  var newfunc = new SProc(name, argNames, argTypes, returnType, nativeFunc);
  var newval = new SValue('native-macro', newfunc);
  exposedNatives[name] = newval;
}
defineFunc('>', ['x', 'y'], ['number', 'number'], 'boolean', function(context, evaluator) {
  return new SValue('boolean', context.lookup('x').value > context.lookup('y').value);
});
defineFunc('<', ['x', 'y'], ['number', 'number'], 'boolean', function(context, evaluator) {
  return new SValue('boolean', context.lookup('x').value < context.lookup('y').value);
});
defineFunc('=', ['x', 'y'], ['number', 'number'], 'boolean', function(context, evaluator) {
  return new SValue('boolean', context.lookup('x').value == context.lookup('y').value);
});
defineFunc('+', ['x', 'y'], ['number', 'number'], 'number', function(context) {
  var x = context.lookup('x').value;
  var y = context.lookup('y').value;
  return new SValue('number', x + y);
});
defineFunc('-', ['x', 'y'], ['number', 'number'], 'number', function(context) {
  var x = context.lookup('x').value;
  var y = context.lookup('y').value;
  return new SValue('number', x - y);
});
defineFunc('*', ['x', 'y'], ['number', 'number'], 'number', function(context) {
  var x = context.lookup('x').value;
  var y = context.lookup('y').value;
  return new SValue('number', x * y);
});
defineFunc('/', ['x', 'y'], ['number', 'number'], 'number', function(context) {
  var x = context.lookup('x').value;
  var y = context.lookup('y').value;
  return new SValue('number', x / y);
});
defineFunc('cons', ['a', 'b'], ['any', 'any'], 'list', function(context, evaluator) {
  return new SValue('list', [context.lookup('a'), context.lookup('b')]);
});
defineFunc('append', ['target', 'value'], ['list', 'any'], 'list', function(context) {
  var target = context.lookup('target');
  var value = context.lookup('value');
  var result = target.value.slice();
  result.push(value);
  return new SValue(target.type, result);
});
defineFunc('car', ['target'], ['list'], 'any', function(context) {
  var target = context.lookup('target');
  return target.value[0];
});
defineFunc('cdr', ['target'], ['list'], 'list', function(context) {
  var target = context.lookup('target');
  return new SValue(target.type, target.value.slice(1));
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
  if(arg.isExpression()) {
    var funcargs = arg.value.slice(1).map(function(val) {
      return val.value;
    });
    var newfunc = new SProc(name, funcargs, [], '', _listToBegin(body));
    var newval = new SValue('function', newfunc);
    context.parent.set(arg.value[0].value, newval);
  } else {
    context.parent.set(arg.value, evaluator.eval(body.value[0], context.parent));
  }
  return SValue.NULL;
});
defineMacro('set!', ['name', 'value'], ['keyword', 'any'], 'null', function(context, evaluator) {
  var value = evaluator.eval(context.lookup('value'), context.parent);
  context.set(context.lookup('name').value, value, true);
  return SValue.NULL;
});
defineMacro('eval', ['body'], ['expression'], 'null', function(context, evaluator) {
  var body = context.lookup('body');
  body.type = 'expression';
  return evaluator.eval(body, context.parent);
});
defineMacro('begin', ['.', 'body'], ['expression'], 'null', function(context, evaluator) {
  var body = context.lookup('body');
  var result;
  for(var i = 0; i < body.value.length; i++) {
    result = evaluator.eval(body.value[i], context.parent);
  }
  return result;
});
defineMacro('let', ['arg', '.', 'body'], ['any'], 'null', function(context, evaluator) {
  var arg = context.lookup('arg');
  var body = context.lookup('body');
  arg = arg.value.map(function(token) {
    var name = token.value[0].value;
    var value = token.value[1];
    context.set(name, value);
  });
  return evaluator.eval(_listToBegin(body), context);
});
defineMacro('lambda', ['arg', '.', 'body'], ['any'], 'any', function(context, evaluator) {
  var arg = context.lookup('arg');
  var body = context.lookup('body');
  arg = arg.value.map(function(token) {
    return token.value;
  });
  var newfunc = new SProc('anonymous', arg, [], '', _listToBegin(body));
  var newval = new SValue('function', newfunc);
  return newval;
});
