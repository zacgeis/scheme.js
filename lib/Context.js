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
    lookup: function(varname) {
      if(this.variables.hasOwnProperty(varname)) {
        return this.variables[varname];
      }
      if(this.parent) {
        return this.parent.lookup(varname);
      }
      return null;
    },
    set: function(varname, value, shouldLookup) {
      if(shouldLookup && this.parent && this.lookup(varname) !== null) {
        this.parent.set(varname, value, shouldLookup);
      } else {
        this.variables[varname] = value;
      }
    }
  };
  return Context;
}());
