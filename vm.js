class Environment {
  constructor() {
    this.table = {};
    this.parent = null;
  }

  get(name) {
    if (this.table.hasOwnProperty(name)) {
      return this.table[name];
    }
    if (this.parent != null) {
      return this.parent.get(name);
    }
    // TODO: probably have this raise an exception of some kind
    return null;
  }

  set(name, value) {
    this.table[name] = value;
  }
}

class Node {
  constructor(nodeName) {
    this.nodeName = nodeName;
  }
}

// TODO: implement some sort of type or type enforcement here
class ConstantNode extends Node {
  constructor(value) {
    super("constant");
    this.value = value;
  }
}

class Variable extends Node {
  constructor(value) {
    super("variable");
    this.value = value;
  }
}

class FunctionNode extends Node {
  constructor(params, body) {
    super("function");
    this.params = params;
    this.body = body;
  }
}

class NativeFunctionNode extends Node {
  constructor(params, callback) {
    super("native_function");
    this.params = params;
    this.callback = callback;
  }
}

class CallNode extends Node {
  constructor(label, args) {
    super("call");
    this.label = label;
    this.args = args;
  }
}

// TODO: only values should ever get stored in the environment.
// Maybe rename to something like Object?
class Value {

}

class FunctionValue extends Value {
  constructor(environment, functionNode) {
    super();
    this.environment = environment;
    this.functionNode = functionNode;
  }
}

class NumberValue extends Value {
  constructor(value) {
    super();
    this.value = value;
  }
}

// It's important to have separation between the program and the execution
// -- Nodes should be separate from their stack values
// A ConstantNode shouldn't be the actual value pushed onto the stack
class Interpreter {
  constructor() {
    this.environment = new Environment();
    this.program = [];
    this.stack = [];
  }

  // Add type hinting an annotations here to the args list
  loadNativeFunctions() {
    this.environment.set("add",
      new FunctionValue(
        this.environment,
        new NativeFunctionNode(["x", "y"], function (x, y) { return x + y; })
      ),
    );
    this.environment.set("print",
      new FunctionValue(
        this.environment,
        new NativeFunctionNode(["value"], function (value) { console.log(value) })
      )
    );
  }

  run() {
    let node = this.program[0];
    let currentEnvironment = this.environment;

    // TODO: Move away from a single ConstantNode into typed Constant Nodes
    if (node instanceof ConstantNode) {
      this.stack.push(new NumberValue(node.value));
    }
    if (node instanceof FunctionNode) {
      this.stack.push
    }
    if (node instanceof NativeFunctionNode) {

    }

  }
}

// TODO: go through and make sure the names are exceptionally clear
// TODO: Constant nodes should have types and type hinting
let test = new Interpreter();
test.loadNativeFunctions();
test.program = [
  // new CallNode("define", [new ConstantNode("x"), new ConstantNode(1)]),
  new CallNode("print", [new CallNode("add", [new ConstantNode(1), new ConstantNode(2)])])
];
test.run();

// Compile

// boolean number string char vector list
// have all code blocks live in their own arrays
// have a list of dependencies between code blocks
// this will make it easier to update code blocks as changes come in

// (define (fact n)
//   (if (eq n 0) 1
//     (* n (fact (- n 1))))
//   (print "test"))
// (fact 2)

// fact:
//   jump fact_if_0_start
// fact_if_0_end:
//   ret
// fact_if_0_start:
//   read "n"
//   const 0
//   call eq
//   jumpif fact_if_0_true
//   jump fact_if_0_false
// fact_if_0_true:
//   const 1
//   jump fact_if_0_end
// fact_if_0_false:
//   read "n"
//   read "n"
//   const 1
//   call -
//   call fact
//   call *
//   jump fact_if_0_end
//
// (define (test n)
//   (print ("start"))
//   (if (eq n 1)
//     (print "one")
//     (print "not one"))
//   (print ("end")))
//
// test:
//   const "start"
//   call print
//   jump test_if_0_start
// test_if_0_end:
//   const "end"
//   call print
//   ret
// test_if_0_start:
//   read "n"
//   const 1
//   call eq
//   jumpif test_if_0_true
//   jump test_if_0_false
// test_if_0_true:
//   const "one"
//   call print
//   jump test_if_0_end
// test_if_0_false:
//   const "not one"
//   call print
//   jump test_if_0_end
