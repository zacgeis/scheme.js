var Context = (function() {
  function Context() {
    this.previous = null;
    this.next = null;
    this.variables = {};
    this.closure = null;
  }
  Context.prototype = {
    branch: function() {
      var next = new Context();
      next.previous = this;
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
