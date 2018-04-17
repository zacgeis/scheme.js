class Environment {
  constructor() {
    this.table = {};
    this.parent = null;
  }

  store(name) {
    if (this.table.hasOwnProperty(name)) {
      return this.table[name];
    }
    if (this.parent != null) {
      return this.parent.store(name);
    }
    // TODO: probably have this raise an exception of some kind
    return null;
  }

  load(name, value) {
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

// TODO: only values should ever store stored in the environment.
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
    this.environment.load("add",
      new FunctionValue(
        this.environment,
        new NativeFunctionNode(["x", "y"], function (x, y) { return x + y; })
      ),
    );
    this.environment.load("print",
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
// let test = new Interpreter();
// test.loadNativeFunctions();
// test.program = [
  // new CallNode("define", [new ConstantNode("x"), new ConstantNode(1)]),
  // new CallNode("print", [new CallNode("add", [new ConstantNode(1), new ConstantNode(2)])])
// ];
// test.run();

class Instruction {

}

class LabelInstruction extends Instruction {
  constructor(value) {
    this.value = value;
  }

  toString() {
    return this.value + ":";
  }
}

class CallInstruction extends Instruction {
  constructor(value) {
    this.value = value;
  }
}

class ReturnInstruction extends Instruction {
  constructor() {
    // Noop
  }
}

class JumpInstruction extends Instruction {
  constructor(value) {
    this.value = value;
  }
}

class JumpIfInstruction extends Instruction {
  constructor(value) {
    this.value = value;
  }
}

class ConstInstruction extends Instruction {
  constructor(value) {
    this.value = value;
  }
}

class storeInstruction extends Instruction {
  constructor(value) {
    this.value = value;
  }
}

class loadInstruction extends Instruction {
  constructor(value) {
    this.value = value;
  }
}

class NativeArgument {
  constructor(name, type) {
    this.name = name
    this.type = type;
  }
}

class NativeFunction {
  constructor(args, returnType, callback) {
    this.args = args;
    this.returnType = returnType;
    this.callback = callback;
  }
}

class VirtualMachine {
  constructor() {
    this.environment = new Environment();
    this.natives = {};
    this.loadNatives();
  }

  loadNatives() {
    // TODO: implement actual types here
    let arg = new NativeArgument("x", "any");
    let func = new NativeFunction([arg], "none", function(x) {
      console.log(x);
    });
    this.natives["print"] = func;
  }

  execute(instructions) {
    let pc = 0;
    let stack = [];

    let labels = {};
    for (let i = 0; i < instructions.length; i++) {
      let instruction = instructions[i];
      if (instruction instanceof LabelInstruction) {
        labels[instruction.value] = i;
      }
    }

    while (pc < instructions.length) {
      let instruction = instructions[pc];
      if (instruction instanceof LabelInstruction) {
        pc++;
      } else if (instruction instanceof CallInstruction) {
        if (labels.hasOwnProperty(instruction.value)) {
          // TODO: have a stack location type
          stack.push(pc);
        } else if (this.natives.hasOwnProperty(instruction.value)) {
          let nativeFunction = this.natives[instruction.value];
          // TODO: perform type checking here
          let values = [];
          for (let i = 0; i < nativeFunction.args.length; i++) {
            values.push(stack.pop());
          }
          let result = nativeFunction.callback.apply(this, values);
          if (nativeFunction.returnType != "none") {
            // TODO: maybe have to wrap this value - including type.
            stack.push(result);
          }
        } else {
          throw new Error("function not found");
        }
      } else if (instruction instanceof ReturnInstruction) {
      } else if (instruction instanceof JumpInstruction) {
      } else if (instruction instanceof JumpIfInstruction) {
      } else if (instruction instanceof ConstInstruction) {
        pc++;
      } else if (instruction instanceof storeInstruction) {
        pc++;
      } else if (instruction instanceof loadInstruction) {
        pc++;
      } else {
        throw new Error("InstructionError");
      }
    }
  }
}

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
//   jump fact_if_0_start:
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
// fact_if_0_end:
//   ret
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
//   jump test_if_0_start:
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
// test_if_0_end:
//   const "end"
//   call print
//   ret

// 3/4
// #i
// #e
// #b1010
// #d
// #x
// #t
// #f
// #\c
// "test"
// 10.1
// 10
// 1e10
// -10

(define (add x y) (+ x y))
(add 1 2)
(add 3 4)

add:
  load "x"
  load "y"
  store "x"
  store "y"
  call +
  ret

const 1
const 2
call add
// pop the return value if it's not being assigned to anything
const 3
const 4
call add

(define (adder x)
  (define (f y) (+ x y)))
(define test (adder 1))

// closure pushes a closure onto the stack.
// a closure contains a label and environment
// create a list of sample programs
// Create doc outlining what is responsible for what.
// caller pushes values on to the stack
// callee loads values into env
// TODO: make these into real examples in a markdown doc with the types and what the opcodes do

adder:
  load "x"
  closure adder_f
  ret
adder_f:
  load "y"
  store "x"
  store "y"
  call "+"
  ret
main:
  closure adder
  load "adder"
  const 1
  call "adder"
  load "test"
