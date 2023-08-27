import MyClass from '../js/exampleclass.js';

log.enableAll();

describe('MyClass tests', () => {
  describe('The class', () => {
    it('can be instantiated', () => {
      chai.assert.isObject(new MyClass());
    });
    it('a = 1', () => {
      const c = new MyClass();
      chai.expect(c.a).to.eql(1);
    });
  });
});
