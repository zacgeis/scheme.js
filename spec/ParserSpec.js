describe("Parser", function() {
  it("should parse simple token streams", function() {
    var input = "(+ 1.0 2.0)";
    var tokens = Lexer.lex(input);
    var ast = Parser.parse(tokens);

    expect(ast.value[0].value[0].value).toEqual('+');
    expect(ast.value[0].value[1].value).toEqual(1);
    expect(ast.value[0].value[2].value).toEqual(2);
  });
  it("should parse nested token groups", function() {
    var input = "(define (add a b) (+ a b))";
    var tokens = Lexer.lex(input);
    var ast = Parser.parse(tokens);

    expect(ast.value[0].value[0].value).toEqual('define');
    expect(ast.value[0].value[1].value[0].value).toEqual('add');
    expect(ast.value[0].value[2].value[0].value).toEqual('+');
    expect(ast.value[0].value[1].value[1].value).toEqual('a');
  });
  it("should parse uncontained statements", function() {
    var input = "(define test 1) test";
    var tokens = Lexer.lex(input);
    var ast = Parser.parse(tokens);

    expect(ast.value[0].value[0].value).toEqual('define');
    expect(ast.value[0].value[1].value).toEqual('test');
    expect(ast.value[0].value[2].value).toEqual(1);
    expect(ast.value[1].value).toEqual('test');
  });
  it("should parse list literals", function() {
    var input = "'(1 2 3)";
    var tokens = Lexer.lex(input);
    var ast = Parser.parse(tokens);

    expect(ast.value[0].type).toEqual('list');
    expect(ast.value[0].value[0].value).toEqual(1);
    expect(ast.value[0].value[1].value).toEqual(2);
    expect(ast.value[0].value[2].value).toEqual(3);
  });
});
