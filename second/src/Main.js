// eventually write a compiler to a vm for this.

function lex(input) {
  var result = [];
  var head = 0;
  var tail = 0;
  var inString = false;
  // focus on the clearest code over the simplest possible code. there might not be a way to condense the duplicate operations below in a readable way.
  while(tail < input.length) {
    if(input[tail] === '"') {
      if(inString) {
        inString = false;
      } else {
        inString = true;
      }
    }

    if(inString) {
      tail += 1;
    } else if(input[tail] === '(' || input[tail] === ')') {
      if(head != tail) {
        result.push(input.substr(head, tail - head));
      }
      result.push(input[tail]);
      tail += 1;
      head = tail;
    } else if(input[tail] === ' ') {
      if(head != tail) {
        result.push(input.substr(head, tail - head));
      }
      tail += 1;
      head = tail;
    } else {
      tail += 1;
    }
  }

  return result;
}

function parse(tokens) {
  var root = {type: 'root', value: []};
  var stack = [root];

  for(var i = 0; i < tokens.length; i++) {
    if(tokens[i] === '(') {
      var test = {type: 'node', value: []};
      stack[stack.length - 1].value.push(test);
      stack.push(test);
    } else if(tokens[i] === ')') {
      stack.pop();
    } else {
      var literal = null;
      if(tokens[i] === 'true') {
        literal = {type: 'boolean', value: true};
      } else if(tokens[i] === 'false') {
        literal = {type: 'boolean', value: false};
      } else if(/^\".*\"$/.test(tokens[i])) {
        literal = {type: 'string', value: tokens[i].substr(1, tokens[i].length - 2)};
      } else if(/^(\-|\+)?[0-9]+(\.[0-9]+)?$/.test(tokens[i])) {
        literal = {type: 'number', value: Number(tokens[i])};
      } else if(/^[A-Za-z\+]+$/.test(tokens[i])) {
        if(stack[stack.length - 1].value.length === 0) {
          literal = {type: 'call', value: tokens[i]};
        } else {
          literal = {type: 'variable', value: tokens[i]};
        }
      } else {
        throw Error('Unknown token: ' + tokens[i]);
      }
      stack[stack.length - 1].value.push(literal);
    }
  }

  return root;
}

function run(ast) {
  if(ast.type !== 'root') {
    throw Error('Malformed AST');
  }

  var program = ast.value;

  var global = {
    '+': add
  };

  var last = null;
  for(var i = 0; i < program.length; i++) {
    var node = program[i];
    var frame = astNodeToFrame(node);
    var root = new StackFrame();
    root.env = global;
    frame.previous = root;

    last = eval(frame);
  }
  return last;
}

function add(frame) {
  var a = frame.args.pop();
  var b = frame.args.pop();
  if(a.type === 'number' && b.type === 'number') {
    return {type: 'number', value: a.value + b.value};
  }
}

function astNodeToFrame(node) {
  var frame = new StackFrame();
  frame.call = node.value[0].value;
  frame.nodes = node.value.slice(1);
  return frame;
}

// by brining the current stack pointed out of local scope, it can be passed around.
// you can now pass frame pointers around to other objects and have them adjust the frame scope.
// scope doesn't need to be local to a function, you can enapsulate it in an object and pass it around
// if and define are not macros

function eval(rootFrame) {
  var current = new FramePointer();
  current.frame = rootFrame;
  while(!current.frame.evaled) {
    if(current.frame.call === 'if') {
      var falseNode = current.frame.nodes.pop();
      var trueNode = current.frame.nodes.pop();
      var conditionNode = current.frame.nodes.pop();
      current.frame.args.push(trueNode);
      current.frame.args.push(falseNode);
      if(conditionNode.type === 'node') {
        var newFrame = astNodeToFrame(conditionNode);
        newFrame.previous = current.frame;
        current.frame = newFrame;
      } else {
        current.frame.args.push(conditionNode);
      }
    }
    if(current.frame.call === 'define') {
      var definition = current.frame.nodes[0];
      var body = current.frame.nodes.slice(1);
      current.frame.nodes = [];
      current.frame.env[definition.value[0].value] = {type: 'func', definition: definition, body: body};
    }
    if(current.frame.nodes.length > 0) {
      var node = current.frame.nodes[0];
      current.frame.nodes = current.frame.nodes.slice(1);
      if(node.type === 'node') {
        var newFrame = astNodeToFrame(node);
        newFrame.previous = current.frame;
        current.frame = newFrame;
      } else {
        // always a value
        current.frame.args.push(node);
      }
    } else {
      if(current.frame.call === 'if') {
        current.frame.evaled = true;
        var condition = current.frame.args.pop();
        var falsePath = current.frame.args.pop();
        var truePath = current.frame.args.pop();
        var path = null;
        if(condition.value) {
          path = truePath;
        } else {
          path = falsePath;
        }
        if(path.type === 'node') {
          var newFrame = astNodeToFrame(path);
          newFrame.previous = current.frame.previous;
          current.frame = newFrame;
        } else {
          current.frame = current.frame.previous;
          current.frame.args.push(path);
        }
      } else if(current.frame.call === 'define') {
        current.frame.evaled = true;
        current.frame.previous.args.push(null);
        current.frame = current.frame.previous;
      } else {
        current.frame.evaled = true;
        if(current.frame.call !== null) {
          var func = current.frame.lookup(current.frame.call);
          if(typeof func === 'function') {
            var value = func(current.frame);
            current.frame.previous.args.push(value);
            current.frame = current.frame.previous;
          } else {
            newFrame.previous = current.frame;
            newFrame.env['a'] = 1;
            newFrame.env['b'] = 2;
            newFrame.nodes = func.body;
            current.frame = newFrame;
          }
        }
      }
    }
  }
  return current.frame.args[0];
}

function FramePointer() {
  this.frame = null;
}

function StackFrame() {
  this.previous = null;
  this.call = null;
  this.args = [];
  this.nodes = [];
  this.env = {};
  this.evaled = false;
}

StackFrame.prototype.lookup = function(name) {
  if(name in this.env) {
    return this.env[name];
  }
  if(this.previous === null) {
    return null;
  }
  return this.previous.lookup(name);
}
