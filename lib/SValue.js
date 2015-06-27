function SValue(type, value) {
  this.type = type;
  this.value = value;
}
SValue.prototype = {
  isAny: function() {
    return true;
  },
  isList: function() {
    return this.type === 'list' || this.isExpression();
  },
  isExpression: function() {
    return this.type === 'expression';
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
  isKeyword: function() {
    return this.type === 'keyword';
  },
  isCallable: function() {
    return this.isFunction() || this.isMacro();
  },
  isFunction: function() {
    return this.type === 'function' || this.isNativeFunction();
  },
  isMacro: function() {
    return this.type === 'macro' || this.isNativeMacro();
  },
  isNativeMacro: function() {
    return this.type === 'native-macro';
  },
  isNativeFunction: function() {
    return this.type === 'native-function';
  },
  isNative: function() {
    return this.isNativeMacro() || this.isNativeFunction();
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
