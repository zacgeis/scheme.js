describe("Evaluator", function() {
  var evaluator;
  beforeEach(function() {
    evaluator = new Evaluator();
  });
  it("should evaluate simple expressions", function() {
    var str = '(+ 1 1)';
    var result = evaluator.input(str);
    expect(result).toEqual(2);
  });
  it("should evaluate nested expressions", function() {
    var str = '(+ (+ 2 3) (+ 1 4))';
    var result = evaluator.input(str);
    expect(result).toEqual(10);
  });
  it("should evaluate variable expressions", function() {
    var str = '(define a 2) (+ (+ a 3) (+ 1 4))';
    var result = evaluator.input(str);
    expect(result).toEqual(10);
  });
  it("should evaluate defined expressions", function() {
    var str = '(define (add a b) (+ a b)) (add 3 2)';
    var result = evaluator.input(str);
    expect(result).toEqual(5);
  });
  it("should allow for mutable expressions", function() {
    var str = '(define a 1) (set! a 3) (+ a 2)';
    var result = evaluator.input(str);
    expect(result).toEqual(5);
  });
  it("should allow for truthy expressions", function() {
    var str = '(> 1 0)';
    var result = evaluator.input(str);
    expect(result).toEqual(true);
  });
  it("should allow for truthy expressions", function() {
    var str = '(< 1 0)';
    var result = evaluator.input(str);
    expect(result).toEqual(false);
  });
  it("should allow for truthy expressions", function() {
    var str = '(= 1 1)';
    var result = evaluator.input(str);
    expect(result).toEqual(true);
  });
  it("should allow for conditional expressions", function() {
    var str = '(if (= 1 1) 2 3)';
    var result = evaluator.input(str);
    expect(result).toEqual(2);
  });
  it("should handle dot expressions", function() {
    var str = '(define (test . args) args) (test 1 2 3)'
    var result = evaluator.input(str);
    expect(result).toEqual([1, 2, 3]);
  });
  it("should allow for recursive expressions", function() {
    var str = '(define (factorial n) (if (= n 0) 1 (* n (factorial (- n 1))))) (factorial 5)';
    var result = evaluator.input(str);
    expect(result).toEqual(120);
  });
  it("should allow for repl like behavior", function() {
    var str1 = '(define a 1)';
    var str2 = '(set! a 3)'
    var str3 = '(+ a 2)';
    evaluator.input(str1);
    evaluator.input(str2);
    var result = evaluator.input(str3);
    expect(result).toEqual(5);
  });
  it("should allow for expression results", function() {
    var str = '(define test "an example string") test';
    var result = evaluator.input(str);
    expect(result).toEqual("an example string");
  });
});
