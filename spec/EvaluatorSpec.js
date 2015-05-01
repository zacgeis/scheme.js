describe("Evaluator", function() {
  it("should evaluate simple expressions", function() {
    var input = '(+ 1 1)';
    var result = Evaluator.main(input);
    expect(result).toEqual(2);
  });
  it("should evaluate nested expressions", function() {
    var input = '(+ (+ 2 3) (+ 1 4))';
    var result = Evaluator.main(input);
    expect(result).toEqual(10);
  });
  it("should evaluate variable expressions", function() {
    var input = '(begin (define a 2) (+ (+ a 3) (+ 1 4)))';
    var result = Evaluator.main(input);
    expect(result).toEqual(10);
  });
  it("should evaluate defined expressions", function() {
    var input = '(begin (define (add a b) (+ a b)) (add 3 2))';
    var result = Evaluator.main(input);
    expect(result).toEqual(5);
  });
  it("should allow for mutable expressions", function() {
    var input = '(begin (define a 1) (set! a 3) (+ a 2))';
    var result = Evaluator.main(input);
    expect(result).toEqual(5);
  });
  it("should allow for truthy expressions", function() {
    var input = '(begin (> 1 0))';
    var result = Evaluator.main(input);
    expect(result).toEqual(true);
  });
  it("should allow for truthy expressions", function() {
    var input = '(begin (< 1 0))';
    var result = Evaluator.main(input);
    expect(result).toEqual(false);
  });
  it("should allow for truthy expressions", function() {
    var input = '(begin (= 1 1))';
    var result = Evaluator.main(input);
    expect(result).toEqual(true);
  });
  it("should allow for conditional expressions", function() {
    var input = '(begin (if (= 1 1) 2 3))';
    var result = Evaluator.main(input);
    expect(result).toEqual(2);
  });
  it("should allow for recursive expressions", function() {
    var input = '(begin (define (factorial n) (if (= n 0) 1 (* n (factorial (- n 1))))) (factorial 5))';
    var result = Evaluator.main(input);
    expect(result).toEqual(120);
  });
});
