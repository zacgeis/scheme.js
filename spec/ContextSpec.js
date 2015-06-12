describe("Context", function() {
  var root;
  beforeEach(function() {
    root = new Context();
    root.set('+', function() {
      return 1;
    });
  });
  it("should handle simple lookups", function() {
    var plus = root.lookup('+');
    expect(typeof plus).toEqual('function');
  });
  it("should handle branching lookups", function() {
    var branch = root.branch();
    branch.set('a', 1);

    var plus = root.lookup('+');
    expect(typeof plus).toEqual('function');
    expect(branch.lookup('a')).toEqual(1);
  });
  it("should handle lookup parent sets", function() {
    var branch = root.branch();
    branch.set('+', 1, true);

    var plus = root.lookup('+');
    expect(plus).toEqual(1);
  });
});
