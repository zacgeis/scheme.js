function Expression() {
  this.value = [];
}
Expression.prototype = {
  at: function(i) {
    return this.value[i];
  },
  car: function() {
    return this.at(0);
  },
  cdr: function() {
    return this.value.slice(1);
  }
}

function Token(type, value) {
  this.type = type;
  this.value = value;
}

function Func(args, func) {
  this.args = args;
  this.func = func;
}

function Macro(args, func) {
  this.args = args;
  this.func = func;
}
