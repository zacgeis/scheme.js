describe("Evaluator", function() {
  var evaluator;
  beforeEach(function() {
    evaluator = new Evaluator();
  });
  it("should evaluate simple expressions", function() {
    var str = '(+ 1 1)';
    var result = evaluator.input(str);
    expect(result).toEqual(new SValue('number', 2));
  });
  it("should evaluate nested expressions", function() {
    var str = '(+ (+ 2 3) (+ 1 4))';
    var result = evaluator.input(str);
    expect(result).toEqual(new SValue('number', 10));
  });
  it("should evaluate variable expressions", function() {
    var str = '(define a 2) (+ (+ a 3) (+ 1 4))';
    var result = evaluator.input(str);
    expect(result).toEqual(new SValue('number', 10));
  });
  it("should evaluate defined expressions", function() {
    var str = '(define (add a b) (+ a b)) (add 3 2)';
    var result = evaluator.input(str);
    expect(result).toEqual(new SValue('number', 5));
  });
  it("should allow for mutable expressions", function() {
    var str = '(define a 1) (set! a 3) (+ a 2)';
    var result = evaluator.input(str);
    expect(result).toEqual(new SValue('number', 5));
  });
  it("should allow for truthy expressions", function() {
    var str = '(> 1 0)';
    var result = evaluator.input(str);
    expect(result).toEqual(new SValue('boolean', true));
  });
  it("should allow for truthy expressions", function() {
    var str = '(< 1 0)';
    var result = evaluator.input(str);
    expect(result).toEqual(new SValue('boolean', false));
  });
  it("should allow for truthy expressions", function() {
    var str = '(= 1 1)';
    var result = evaluator.input(str);
    expect(result).toEqual(new SValue('boolean', true));
  });
  it("should allow for conditional expressions", function() {
    var str = '(if (= 1 1) 2 3)';
    var result = evaluator.input(str);
    expect(result).toEqual(new SValue('number', 2));
  });
  it("should handle dot expressions", function() {
    var str = '(define (test . args) args) (test 1 2 3)';
    var result = evaluator.input(str);
    expect(result).toEqual(new SValue('list', [new SValue('number', 1), new SValue('number', 2), new SValue('number', 3)]));
  });
  it("should allow for recursive expressions", function() {
    var str = '(define (factorial n) (if (= n 0) 1 (* n (factorial (- n 1))))) (factorial 5)';
    var result = evaluator.input(str);
    expect(result).toEqual(new SValue('number', 120));
  });
  it("should allow for repl like behavior", function() {
    var str1 = '(define a 1)';
    var str2 = '(set! a 3)';
    var str3 = '(+ a 2)';
    evaluator.input(str1);
    evaluator.input(str2);
    var result = evaluator.input(str3);
    expect(result).toEqual(new SValue('number', 5));
  });
  it("should allow for expression results", function() {
    var str = '(define test "an example string") test';
    var result = evaluator.input(str);
    expect(result).toEqual(new SValue('string', 'an example string'));
  });
  it("should support lambdas", function() {
    var str = '(define test (lambda (a b) (+ a b))) (test 1 2)';
    var result = evaluator.input(str);
    expect(result).toEqual(new SValue('number', 3));
  });
  it("should support eval", function() {
    var str = "(eval '(+ 1 2)";
    var result = evaluator.input(str);
    expect(result).toEqual(new SValue('number', 3));
  });
  it("should support let", function() {
    var str = '(let ((a 1) (b 4)) (= 1 1) (+ a b))';
    var result = evaluator.input(str);
    expect(result).toEqual(new SValue('number', 5));
  });
  it("should support cons", function() {
    var str = '(cons 1 2)';
    var result = evaluator.input(str);
    expect(result).toEqual(new SValue('list', [new SValue('number', 1), new SValue('number', 2)]));
  });
  it("should support car", function() {
    var str = '(cdr (cons 1 2))';
    var result = evaluator.input(str);
    expect(result).toEqual(new SValue('list', [new SValue('number', 2)]));
  });
  it("should support cdr", function() {
    var str = '(car (cons 1 2))';
    var result = evaluator.input(str);
    expect(result).toEqual(new SValue('number', 1));
  });
});
