describe("Context", function() {
  var root;
  beforeEach(function() {
    root = new Context();
    root.set('+', function() {
      return 1;
    });
  });
  it("should handle simple resovles", function() {
    var plus = root.resolve('+');
    expect(typeof plus).toEqual('function');
  });
  it("should handle branching resolves", function() {
    var branch = root.branch();
    branch.set('a', 1);

    var plus = root.resolve('+');
    expect(typeof plus).toEqual('function');
    expect(branch.resolve('a')).toEqual(1);
  });
  it("should handle resolve parent sets", function() {
    var branch = root.branch();
    branch.set('+', 1, true);

    var plus = root.resolve('+');
    expect(typeof plus).toEqual('function');
  });
});
