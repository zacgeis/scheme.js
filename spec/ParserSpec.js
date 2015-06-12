describe("Parser", function() {
  it("should parse simple token streams", function() {
    var input = "(+ 1 2)";
    var tokens = Lexer.lex(input);
    var ast = Parser.parse(tokens);

    expect(ast[0].at(0).value).toEqual('+');
    expect(ast[0].at(1).value).toEqual(1);
    expect(ast[0].at(2).value).toEqual(2);
  });
  it("should parse nested token groups", function() {
    var input = "(define (add a b) (+ a b))";
    var tokens = Lexer.lex(input);
    var ast = Parser.parse(tokens);

    expect(ast[0].at(0).value).toEqual('define');
    expect(ast[0].at(1).at(0).value).toEqual('add');
    expect(ast[0].at(2).at(0).value).toEqual('+');
  });
  it("should parse uncontained statements", function() {
    var input = "(define test 1) test";
    var tokens = Lexer.lex(input);
    var ast = Parser.parse(tokens);

    expect(ast[0].at(1).value).toEqual('test');
    expect(ast[1].value).toEqual('test');
  });
});
