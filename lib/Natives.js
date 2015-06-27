var exposedNatives = {};
function _listToBegin(val) {
  return new SValue('expression', [new SValue('variable', 'begin')].concat(val.value));
}
function defineProc(name, argNames, argTypes, returnType, nativeProc) {
  var newproc = new SProc(name, argNames, argTypes, returnType, nativeProc);
  var newval = new SValue('proc', newproc, {native: true});
  exposedNatives[name] = newval;
}
function defineMacro(name, argNames, argTypes, returnType, nativeProc) {
  var newmacro = new SProc(name, argNames, argTypes, returnType, nativeProc);
  var newval = new SValue('macro', newmacro, {native: true});
  exposedNatives[name] = newval;
}
defineProc('>', ['x', 'y'], ['number', 'number'], 'boolean', function(frame, evaluator) {
  return new SValue('boolean', frame.resolve('x').value > frame.resolve('y').value);
});
defineProc('<', ['x', 'y'], ['number', 'number'], 'boolean', function(frame, evaluator) {
  return new SValue('boolean', frame.resolve('x').value < frame.resolve('y').value);
});
defineProc('=', ['x', 'y'], ['number', 'number'], 'boolean', function(frame, evaluator) {
  return new SValue('boolean', frame.resolve('x').value == frame.resolve('y').value);
});
defineProc('+', ['x', 'y'], ['number', 'number'], 'number', function(frame) {
  var x = frame.resolve('x').value;
  var y = frame.resolve('y').value;
  return new SValue('number', x + y);
});
defineProc('-', ['x', 'y'], ['number', 'number'], 'number', function(frame) {
  var x = frame.resolve('x').value;
  var y = frame.resolve('y').value;
  return new SValue('number', x - y);
});
defineProc('*', ['x', 'y'], ['number', 'number'], 'number', function(frame) {
  var x = frame.resolve('x').value;
  var y = frame.resolve('y').value;
  return new SValue('number', x * y);
});
defineProc('/', ['x', 'y'], ['number', 'number'], 'number', function(frame) {
  var x = frame.resolve('x').value;
  var y = frame.resolve('y').value;
  return new SValue('number', x / y);
});
defineProc('cons', ['a', 'b'], ['any', 'any'], 'list', function(frame, evaluator) {
  return new SValue('list', [frame.resolve('a'), frame.resolve('b')]);
});
defineProc('append', ['target', 'value'], ['list', 'any'], 'list', function(frame) {
  var target = frame.resolve('target');
  var value = frame.resolve('value');
  var result = target.value.slice();
  result.push(value);
  return new SValue(target.type, result);
});
defineProc('car', ['target'], ['list'], 'any', function(frame) {
  var target = frame.resolve('target');
  return target.value[0];
});
defineProc('cdr', ['target'], ['list'], 'list', function(frame) {
  var target = frame.resolve('target');
  return new SValue(target.type, target.value.slice(1));
});
defineMacro('if', ['cond', 'a', 'b'], ['expression', 'any', 'any'], 'any', function(frame, evaluator) {
  if(evaluator.eval(frame.resolve('cond'), frame.parent).value) {
    return evaluator.eval(frame.resolve('a'), frame.parent);
  } else {
    return evaluator.eval(frame.resolve('b'), frame.parent);
  }
});
defineMacro('define', ['arg', '.', 'body'], ['any', 'any'], 'null', function(frame, evaluator) {
  var arg = frame.resolve('arg');
  var body = frame.resolve('body');
  if(arg.isExpression()) {
    var Procargs = arg.value.slice(1).map(function(val) {
      return val.value;
    });
    var newproc = new SProc(name, Procargs, [], '', _listToBegin(body));
    var newval = new SValue('proc', newproc);
    frame.parent.set(arg.value[0].value, newval);
  } else {
    frame.parent.set(arg.value, evaluator.eval(body.value[0], frame.parent));
  }
  return SValue.NULL;
});
defineMacro('set!', ['name', 'value'], ['variable', 'any'], 'null', function(frame, evaluator) {
  var value = evaluator.eval(frame.resolve('value'), frame.parent);
  var name = frame.resolve('name').value;
  var owner = frame.findOwner(name);
  owner.set(name, value);
  return SValue.NULL;
});
defineMacro('eval', ['body'], ['expression'], 'null', function(frame, evaluator) {
  var body = frame.resolve('body');
  body.type = 'expression';
  return evaluator.eval(body, frame.parent);
});
defineMacro('begin', ['.', 'body'], ['expression'], 'null', function(frame, evaluator) {
  var body = frame.resolve('body');
  var result;
  for(var i = 0; i < body.value.length; i++) {
    result = evaluator.eval(body.value[i], frame.parent);
  }
  return result;
});
defineMacro('let', ['arg', '.', 'body'], ['any'], 'null', function(frame, evaluator) {
  var arg = frame.resolve('arg');
  var body = frame.resolve('body');
  arg = arg.value.map(function(token) {
    var name = token.value[0].value;
    var value = token.value[1];
    frame.set(name, value);
  });
  return evaluator.eval(_listToBegin(body), frame);
});
defineMacro('lambda', ['arg', '.', 'body'], ['any'], 'any', function(frame, evaluator) {
  var arg = frame.resolve('arg');
  var body = frame.resolve('body');
  arg = arg.value.map(function(token) {
    return token.value;
  });
  var newproc = new SProc('anonymous', arg, [], '', _listToBegin(body));
  var newval = new SValue('proc', newproc);
  return newval;
});
