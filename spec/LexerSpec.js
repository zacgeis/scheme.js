function expectToken(token, type, value) {
  expect(token.type).toEqual(type);
  expect(token.value).toEqual(value);
}

describe("Lexer", function() {
  it("should tokenize simple expressions", function() {
    var input = "(+ 1 1)";
    var tokens = Lexer.lex(input);

    tokens.reverse();
    expectToken(tokens.pop(), 'delimiter', '(');
    expectToken(tokens.pop(), 'variable', '+');
    expectToken(tokens.pop(), 'number', '1');
    expectToken(tokens.pop(), 'number', '1');
    expectToken(tokens.pop(), 'delimiter', ')');
  });
  it("should tokenize numbers", function() {
    var input = "(+ 1.0 100)";
    var tokens = Lexer.lex(input);

    tokens.reverse();
    expectToken(tokens.pop(), 'delimiter', '(');
    expectToken(tokens.pop(), 'variable', '+');
    expectToken(tokens.pop(), 'number', '1.0');
    expectToken(tokens.pop(), 'number', '100');
    expectToken(tokens.pop(), 'delimiter', ')');
  });
  it("should tokenize booleans", function() {
    var input = "(= #t #f)";
    var tokens = Lexer.lex(input);

    tokens.reverse();
    expectToken(tokens.pop(), 'delimiter', '(');
    expectToken(tokens.pop(), 'variable', '=');
    expectToken(tokens.pop(), 'boolean', '#t');
    expectToken(tokens.pop(), 'boolean', '#f');
    expectToken(tokens.pop(), 'delimiter', ')');
  });
  it("should tokenize strings", function() {
    var input = "(display \"an example string\")";
    var tokens = Lexer.lex(input);

    tokens.reverse();
    expectToken(tokens.pop(), 'delimiter', '(');
    expectToken(tokens.pop(), 'variable', 'display');
    expectToken(tokens.pop(), 'string', 'an example string');
    expectToken(tokens.pop(), 'delimiter', ')');
  });
  it("should tokenize uncontained variables", function() {
    var input = "(define \"an example string\") test";
    var tokens = Lexer.lex(input);

    tokens.reverse();
    expectToken(tokens.pop(), 'delimiter', '(');
    expectToken(tokens.pop(), 'variable', 'define');
    expectToken(tokens.pop(), 'string', 'an example string');
    expectToken(tokens.pop(), 'delimiter', ')');
    expectToken(tokens.pop(), 'variable', 'test');
  });
  it("should tokenzie atoms", function() {
    var input = "(define (add a b) (+ a b))";
    var tokens = Lexer.lex(input);

    tokens.reverse();
    expectToken(tokens.pop(), 'delimiter', '(');
    expectToken(tokens.pop(), 'variable', 'define');
    expectToken(tokens.pop(), 'delimiter', '(');
    expectToken(tokens.pop(), 'variable', 'add');
    expectToken(tokens.pop(), 'variable', 'a');
    expectToken(tokens.pop(), 'variable', 'b');
    expectToken(tokens.pop(), 'delimiter', ')');
    expectToken(tokens.pop(), 'delimiter', '(');
    expectToken(tokens.pop(), 'variable', '+');
    expectToken(tokens.pop(), 'variable', 'a');
    expectToken(tokens.pop(), 'variable', 'b');
    expectToken(tokens.pop(), 'delimiter', ')');
    expectToken(tokens.pop(), 'delimiter', ')');
  });
});
