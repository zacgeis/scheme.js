var Environment = (function() {
  function Environment() {
    this.par = null;
    this.vs = {};
  }
  Environment.prototype = {
    branch: function() {
      var e = new Environment();
      e.par = this;
      return e;
    },
    resolve: function(name) {
      if(this.vs.hasOwnProperty(name)) {
        return this.vs[name];
      }
      if(this.par) {
        return this.par.resolve(name);
      }
      return null;
    },
    set: function(key, val, resolve) {
      if(resolve && this.par && this.resolve(key) !== null) {
        this.par.set(key, val, true);
      } else {
        this.vs[key] = val;
      }
    },
    setS: function(key, val, resolve) {
      val.s = true;
      this.set(key, val, resolve);
    }
  }

  return Environment;
}());
