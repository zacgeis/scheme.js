describe("Environment", function() {
  var root;
  beforeEach(function() {
    root = new Environment();
    root.set('+', function() {
      return 1;
    });
  });
  it("should handle simple lookups", function() {
    var plus = root.resolve('+');
    expect(typeof plus).toEqual('function');
  });
  it("should handle branching lookups", function() {
    var branch = root.branch();
    branch.set('a', 1);

    var plus = root.resolve('+');
    expect(typeof plus).toEqual('function');
    expect(branch.resolve('a')).toEqual(1);
  });
  it("should handle resolving parent sets", function() {
    var branch = root.branch();
    branch.set('+', 1, true);

    var plus = root.resolve('+');
    expect(plus).toEqual(1);
  });
});
