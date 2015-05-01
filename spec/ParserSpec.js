describe("Parser", function() {
  it("should parse simple token streams", function() {
    var input = ['(', '+', 1, 1, ')'];
    var tokens = Parser.parse(input);
    expect(tokens).toEqual(['+', 1, 1]);
  });
  it("should parse nested token groups", function() {
    var input = ['(', 'define', '(', 'add', 'a', 'b', ')', '(', '+', 'a', 'b', ')', ')'];
    var tokens = Parser.parse(input);
    expect(tokens).toEqual(['define', ['add', 'a', 'b'], ['+', 'a', 'b']]);
  });
});
