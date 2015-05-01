describe("Lexer", function() {
  it("should lex simple expressions", function() {
    var input = "(+ 1 1)";
    var tokens = Lexer.lex(input);
    expect(tokens).toEqual(['(', '+', 1, 1, ')']);
  });
  it("should group numbers correctly", function() {
    var input = "(+ 1.0 100)";
    var tokens = Lexer.lex(input);
    expect(tokens).toEqual(['(', '+', 1, 100, ')']);
  });
  it("should group atoms correctly", function() {
    var input = "(define (add a b) (+ a b))";
    var tokens = Lexer.lex(input);
    expect(tokens).toEqual(['(', 'define', '(', 'add', 'a', 'b', ')', '(', '+', 'a', 'b', ')', ')']);
  });
});
