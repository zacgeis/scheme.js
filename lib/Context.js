var Context = (function() {
  function Context() {
    this.parent = null;
    this.variables = {};
  }
  Context.prototype = {
    branch: function() {
      var next = new Context();
      next.parent = this;
      return next;
    },
    resolve: function(name) {
      var owner = this.findOwner(name);
      if(owner) {
        return owner.variables[name];
      }
      return null;
    },
    findOwner: function(name) {
      if(this.variables.hasOwnProperty(name)) {
        return this;
      }
      if(this.parent) {
        return this.parent.findOwner(name);
      }
      return null;
    },
    set: function(varname, value) {
      this.variables[varname] = value;
    }
  };
  return Context;
}());
