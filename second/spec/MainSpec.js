var test = '(print (+ 1 (+ 5 3)))';
var test2 = '(print "hello")';

describe('lex', function() {
  it('tokenifys a string', function() {
    var input = '(print 1 "a string" true)';
    var result = lex(input);
    expect(result).toEqual(['(', 'print', '1', '"a string"', 'true', ')']);
  });
});

describe('parse', function() {
  it('parses a list of tokens into a tree', function() {
    var input = '(print 1 "a string" true test)';
    var output = parse(lex(input));
    var expected = {
      type: 'root',
      value: [
        {
          type: 'node',
          value: [
            {type: 'call', value: 'print'},
            {type: 'number', value: 1},
            {type: 'string', value: 'a string'},
            {type: 'boolean', value: true},
            {type: 'variable', value: 'test'}
          ]
        }
      ]
    };
    expect(output).toEqual(expected);
  });

  it('parses nested structures', function() {
    var input = '(+ (+ 2 3) 1)';
    var output = parse(lex(input));
    var expected = {
      type: 'root',
      value: [
        {
          type: 'node',
          value: [
            {type: 'call', value: '+'},
            {
              type: 'node',
              value: [
                {type: 'call', value: '+'},
                {type: 'number', value: 2},
                {type: 'number', value: 3}
              ]
            },
            {type: 'number', value: 1}
          ]
        }
      ]
    };
    expect(output).toEqual(expected);
  });
});

describe('run', function() {
  it('evaluates a simple expression', function() {
    var input = '(+ (+ 2 3) (+ 2 1))';
    var output = run(parse(lex(input)));
    expect(output).toEqual({type: 'number', value: 8});
  });

  it('evaluates a simple true if conditional', function() {
    var input = '(if true (+ 2 3) (+ 2 (+ 1 0)))';
    var output = run(parse(lex(input)));
    expect(output).toEqual({type: 'number', value: 5});
  });

  it('evaluates a simple false if conditional', function() {
    var input = '(if false (+ 2 3) (+ 2 (+ 1 0)))';
    var output = run(parse(lex(input)));
    expect(output).toEqual({type: 'number', value: 3});
  });

  it('returns the last expression', function() {
    var input = '(+ 1 2) (+ 3 4)';
    var output = run(parse(lex(input)));
    expect(output).toEqual({type: 'number', value: 7});
  });

  // it('returns a simple constant', function() {
  //   var input = '"test"';
  //   var output = run(parse(lex(input)));
  //   expect(output).toEqual({type: 'string', value: 'test'});
  // });

  it('allows defining functions', function() {
    var input = '(define (add a b) (+ a b)) (add 1 2)';
    var output = run(parse(lex(input)));
    expect(output).toEqual({type: 'number', value: 3});
  });
});
