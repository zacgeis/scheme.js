describe("Parser", function() {
  it("should parse simple token streams", function() {
    var input = "(+ 1.0 2.0)";
    var tokens = Lexer.lex(input);
    var ast = Parser.parse(tokens);

    expect(_car(_car(ast)).value).toEqual('+');
    expect(_car(_cdr(_car(ast))).value).toEqual(1);
    expect(_car(_cdr(_cdr(_car(ast)))).value).toEqual(2);
  });
  it("should parse nested token groups", function() {
    var input = "(define (add a b) (+ a b))";
    var tokens = Lexer.lex(input);
    var ast = Parser.parse(tokens);

    expect(_car(_car(ast)).value).toEqual('define');
    expect(_car(_car(_cdr(_car(ast)))).value).toEqual('add');
    expect(_car(_car(_cdr(_cdr(_car(ast))))).value).toEqual('+');
    expect(_car(_cdr(_car(_cdr(_cdr(_car(ast)))))).value).toEqual('a');
  });
  it("should parse uncontained statements", function() {
    var input = "(define test 1) test";
    var tokens = Lexer.lex(input);
    var ast = Parser.parse(tokens);

    expect(_car(_car(ast)).value).toEqual('define');
    expect(_car(_cdr(_car(ast))).value).toEqual('test');
    expect(_car(_cdr(_cdr(_car(ast)))).value).toEqual(1);
    expect(_car(_cdr(ast)).value).toEqual('test');
  });
  it("should parse list literals", function() {
    var input = "'(1 2 3)";
    var tokens = Lexer.lex(input);
    var ast = Parser.parse(tokens);

    expect(_car(ast).type).toEqual('list');
    expect(_car(_car(ast)).value).toEqual(1);
    expect(_car(_cdr(_car(ast))).value).toEqual(2);
    expect(_car(_cdr(_cdr(_car(ast)))).value).toEqual(3);
  });
});
