function SValue(type, value, flags) {
  this.type = type;
  this.value = value;
  this.flags = flags || {};
}
SValue.prototype = {
  isAny: function() {
    return true;
  },
  isExpression: function() {
    return this.type === 'expression';
  },
  isList: function() {
    return this.type === 'list' || this.isExpression();
  },
  isString: function() {
    return this.type === 'string';
  },
  isBoolean: function() {
    return this.type === 'boolean';
  },
  isNumber: function() {
    return this.type === 'number';
  },
  isVariable: function() {
    return this.type === 'variable';
  },
  isProc: function() {
    return this.type === 'proc';
  },
  isArray: function() {
    return this.type === 'array';
  },
  isMacro: function() {
    return this.type === 'macro';
  },
  isCallable: function() {
    return this.isProc() || this.isMacro();
  },
  isNative: function() {
    return this.flags.native;
  },
  isNull: function() {
    if(this.isList() && this.value.length === 0) {
      return true;
    }
    if(this.type === 'null') {
      return true;
    }
    return false;
  }
};
SValue.prototype.NULL = new SValue('null', null);
