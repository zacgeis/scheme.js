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
  it("should branch a traversable stack", function() {
    var branch1 = root.branch();
    var branch2 = branch1.branch();
    var branch3 = branch2.branch();

    expect(root.previous).toEqual(null);
    expect(root.next).toEqual(branch1);

    expect(branch1.previous).toEqual(root);
    expect(branch1.next).toEqual(branch2);

    expect(branch2.previous).toEqual(branch1);
    expect(branch2.next).toEqual(branch3);

    expect(branch3.previous).toEqual(branch2);
    expect(branch3.next).toEqual(null);
  });
});
