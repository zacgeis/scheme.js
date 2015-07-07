var Context = (function() {
  function Context() {
    this.depth = 0;
    this.previous = null;
    this.next = null;
    this.closure = null;
    this.ret = null;
    this.variables = {};
  }
  Context.prototype = {
    branch: function() {
      var next = new Context();
      next.previous = this;
      next.depth = this.depth + 1;
      this.next = next;
      return next;
    },
    resolve: function(name) {
      var owner = this.findOwner(name);
      if(owner) {
        return owner.variables[name];
      }
      return null;
    },
    include: function(closure) {
      this.closure = closure;
    },
    findOwner: function(name) {
      if(this.variables.hasOwnProperty(name)) {
        return this;
      }
      if(this.closure && this.closure.variables.hasOwnProperty(name)) {
        return this.closure;
      }
      if(this.previous) {
        return this.previous.findOwner(name);
      }
      return null;
    },
    set: function(varname, value) {
      this.variables[varname] = value;
    }
  };
  return Context;
}());
