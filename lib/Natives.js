var exposedNatives = {};
function _listToExpressionList(val) {
  return new SValue('expression-list', val.value);
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
defineProc('>', ['x', 'y'], ['number', 'number'], 'boolean', function(frame, evaluator, ret) {
  ret(new SValue('boolean', frame.resolve('x').value > frame.resolve('y').value));
});
defineProc('<', ['x', 'y'], ['number', 'number'], 'boolean', function(frame, evaluator, ret) {
  ret(new SValue('boolean', frame.resolve('x').value < frame.resolve('y').value));
});
defineProc('=', ['x', 'y'], ['number', 'number'], 'boolean', function(frame, evaluator, ret) {
  ret(new SValue('boolean', frame.resolve('x').value == frame.resolve('y').value));
});
defineProc('+', ['x', 'y'], ['number', 'number'], 'number', function(frame, evaluator, ret) {
  var x = frame.resolve('x').value;
  var y = frame.resolve('y').value;
  ret(new SValue('number', x + y));
});
defineProc('-', ['x', 'y'], ['number', 'number'], 'number', function(frame, evaluator, ret) {
  var x = frame.resolve('x').value;
  var y = frame.resolve('y').value;
  ret(new SValue('number', x - y));
});
defineProc('*', ['x', 'y'], ['number', 'number'], 'number', function(frame, evaluator, ret) {
  var x = frame.resolve('x').value;
  var y = frame.resolve('y').value;
  ret(new SValue('number', x * y));
});
defineProc('/', ['x', 'y'], ['number', 'number'], 'number', function(frame, evaluator, ret) {
  var x = frame.resolve('x').value;
  var y = frame.resolve('y').value;
  ret(new SValue('number', x / y));
});
defineProc('cons', ['a', 'b'], ['any', 'any'], 'list', function(frame, evaluator, ret) {
  ret(new SValue('list', [frame.resolve('a'), frame.resolve('b')]));
});
defineProc('append', ['target', 'value'], ['list', 'any'], 'list', function(frame, evaluator, ret) {
  var target = frame.resolve('target');
  var value = frame.resolve('value');
  var result = target.value.slice();
  result.push(value);
  ret(new SValue(target.type, result));
});
defineProc('car', ['target'], ['list'], 'any', function(frame, evaluator, ret) {
  var target = frame.resolve('target');
  ret(target.value[0]);
});
defineProc('cdr', ['target'], ['list'], 'list', function(frame, evaluator, ret) {
  var target = frame.resolve('target');
  ret(new SValue(target.type, target.value.slice(1)));
});
defineProc('debugger', ['arg'], ['any'], 'any', function(frame, evaluator, ret) {
  var arg = frame.resolve('arg');
  debugger;
  ret(arg);
});
defineMacro('if', ['cond', 'a', 'b'], ['expression', 'any', 'any'], 'any', function(frame, evaluator, ret) {
  evaluator.eval(frame.resolve('cond'), frame.previous, function(result) {
    if(result.value) {
      evaluator.eval(frame.resolve('a'), frame.previous, ret);
    } else {
      evaluator.eval(frame.resolve('b'), frame.previous, ret);
    }
  });
});
defineMacro('define', ['arg', '.', 'body'], ['any', 'any'], 'null', function(frame, evaluator, ret) {
  var arg = frame.resolve('arg');
  var body = frame.resolve('body');
  if(arg.isExpression()) {
    var name = arg.value[0].value;
    var procargs = arg.value.slice(1).map(function(val) {
      return val.value;
    });
    var newproc = new SProc(name, procargs, [], '', _listToExpressionList(body), frame.previous);
    var newval = new SValue('proc', newproc);
    frame.previous.set(name, newval);
    ret(SValue.NULL);
  } else {
    evaluator.eval(body.value[0], frame.previous, function(result) {
      frame.previous.set(arg.value, result);
      ret(SValue.NULL);
    });
  }
});
defineMacro('set!', ['name', 'value'], ['variable', 'any'], 'null', function(frame, evaluator, ret) {
  evaluator.eval(frame.resolve('value'), frame.previous, function(value) {
    var name = frame.resolve('name').value;
    var owner = frame.findOwner(name);
    owner.set(name, value);
    ret(SValue.NULL);
  });
});
defineMacro('eval', ['body'], ['expression'], 'null', function(frame, evaluator, ret) {
  var body = frame.resolve('body');
  body.type = 'expression';
  evaluator.eval(body, frame.previous, ret);
});
defineMacro('begin', ['.', 'body'], ['expression'], 'null', function(frame, evaluator, ret) {
  var body = frame.resolve('body');
  var expressionList = _listToExpressionList(body);
  evaluator.eval(expressionList, frame.previous, ret);
});
defineMacro('let', ['arg', '.', 'body'], ['any'], 'null', function(frame, evaluator, ret) {
  var arg = frame.resolve('arg');
  var body = frame.resolve('body');
  arg = arg.value.map(function(token) {
    var name = token.value[0].value;
    var value = token.value[1];
    frame.set(name, value);
  });
  evaluator.eval(_listToExpressionList(body), frame, ret);
});
defineMacro('lambda', ['arg', '.', 'body'], ['any'], 'any', function(frame, evaluator, ret) {
  var arg = frame.resolve('arg');
  var body = frame.resolve('body');
  arg = arg.value.map(function(token) {
    return token.value;
  });
  var newproc = new SProc('anonymous', arg, [], '', _listToExpressionList(body), frame.previous);
  var newval = new SValue('proc', newproc);
  ret(newval);
});
