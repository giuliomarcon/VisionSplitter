var Cat = function() {}
Cat.prototype = {
  legs: 4,
  head: 2,
  ears: 2,
  sayHello: function() {
    console.log('meow');
  }
};
module.exports = Cat;