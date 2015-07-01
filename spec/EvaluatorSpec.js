describe("Evaluator", function() {
  var evaluator;
  beforeEach(function() {
    evaluator = new Evaluator();
  });
  it("should evaluate simple expressions", function(done) {
    var str = '(+ 1 1)';
    evaluator.input(str, function(result) {
      expect(result).toEqual(new SValue('number', 2));
      done();
    });
  });
  it("should evaluate nested expressions", function(done) {
    var str = '(+ (+ 2 3) (+ 1 4))';
    evaluator.input(str, function(result) {
      expect(result).toEqual(new SValue('number', 10));
      done();
    });
  });
  it("should evaluate variable expressions", function(done) {
    var str = '(define a 2) (+ (+ a 3) (+ 1 4))';
    evaluator.input(str, function(result) {
      expect(result).toEqual(new SValue('number', 10));
      done();
    });
  });
  it("should evaluate defined expressions", function(done) {
    var str = '(define (add a b) (+ a b)) (add 3 2)';
    evaluator.input(str, function(result) {
      expect(result).toEqual(new SValue('number', 5));
      done();
    });
  });
  it("should allow for mutable expressions", function(done) {
    var str = '(define a 1) (set! a 3) (+ a 2)';
    evaluator.input(str, function(result) {
      expect(result).toEqual(new SValue('number', 5));
      done();
    });
  });
  it("should allow for truthy expressions", function(done) {
    var str = '(> 1 0)';
    evaluator.input(str, function(result) {
      expect(result).toEqual(new SValue('boolean', true));
      done();
    });
  });
  it("should allow for truthy expressions", function(done) {
    var str = '(< 1 0)';
    evaluator.input(str, function(result) {
      expect(result).toEqual(new SValue('boolean', false));
      done();
    });
  });
  it("should allow for truthy expressions", function(done) {
    var str = '(= 1 1)';
    evaluator.input(str, function(result) {
      expect(result).toEqual(new SValue('boolean', true));
      done();
    });
  });
  it("should allow for conditional expressions", function(done) {
    var str = '(if (= 1 1) 2 3)';
    evaluator.input(str, function(result) {
      expect(result).toEqual(new SValue('number', 2));
      done();
    });
  });
  it("should handle dot expressions", function(done) {
    var str = '(define (test . args) args) (test 1 2 3)';
    evaluator.input(str, function(result) {
      expect(result).toEqual(new SValue('list', [new SValue('number', 1), new SValue('number', 2), new SValue('number', 3)]));
      done();
    });
  });
  it("should allow for recursive expressions", function(done) {
    var str = '(define (factorial n) (if (= n 0) 1 (* n (factorial (- n 1))))) (factorial 5)';
    evaluator.input(str, function(result) {
      expect(result).toEqual(new SValue('number', 120));
      done();
    });
  });
  it("should allow for repl like behavior", function(done) {
    var str1 = '(define a 1)';
    var str2 = '(set! a 3)';
    var str3 = '(+ a 2)';
    evaluator.input(str1);
    evaluator.input(str2);
    evaluator.input(str3, function(result) {
      expect(result).toEqual(new SValue('number', 5));
      done();
    });
  });
  it("should allow for expression results", function(done) {
    var str = '(define test "an example string") test';
    evaluator.input(str, function(result) {
      expect(result).toEqual(new SValue('string', 'an example string'));
      done();
    });
  });
  it("should support lambdas", function(done) {
    var str = '(define test (lambda (a b) (+ a b))) (test 1 2)';
    evaluator.input(str, function(result) {
      expect(result).toEqual(new SValue('number', 3));
      done();
    });
  });
  it("should support eval", function(done) {
    var str = "(eval '(+ 1 2)";
    evaluator.input(str, function(result) {
      expect(result).toEqual(new SValue('number', 3));
      done();
    });
  });
  it("should support let", function(done) {
    var str = '(let ((a 1) (b 4)) (= 1 1) (+ a b))';
    evaluator.input(str, function(result) {
      expect(result).toEqual(new SValue('number', 5));
      done();
    });
  });
  it("should support cons", function(done) {
    var str = '(cons 1 2)';
    evaluator.input(str, function(result) {
      expect(result).toEqual(new SValue('list', [new SValue('number', 1), new SValue('number', 2)]));
      done();
    });
  });
  it("should support car", function(done) {
    var str = '(cdr (cons 1 2))';
    evaluator.input(str, function(result) {
      expect(result).toEqual(new SValue('list', [new SValue('number', 2)]));
      done();
    });
  });
  it("should support cdr", function(done) {
    var str = '(car (cons 1 2))';
    evaluator.input(str, function(result) {
      expect(result).toEqual(new SValue('number', 1));
      done();
    });
  });
  it("should support closures", function(done) {
    var str = '(define (adder x) (lambda (y) (+ x y))) (define a (adder 5)) (a 4)';
    evaluator.input(str, function(result) {
      expect(result).toEqual(new SValue('number', 9));
      done();
    });
  });
});
