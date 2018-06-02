const assert = require('assert')
/** @type {JustAnotherDi.ContainerInterface} */
const Container = require('../lib/index').Container
const FooClass = require('./Foo/FooClass')
const BarClass = require('./Foo/BarClass')

describe('Dependency Injector container', function () {
  let di

  beforeEach(function () {
    di = new Container()
  })

  it('should keep scalar value', function () {
    const value = 123
    di.addScalar('my.value', value)
    assert(di.get('my.value') === value)
  })

  it('should throw error if called create on scalar', function () {
    const value = 123
    let error = false
    di.addScalar('my.value', value)
    try {
      di.create('my.value')
    } catch (ex) {
      error = ex
    }

    assert(error !== false)
  })

  it('should work with factory function', function () {
    const name = 'my.factory.function'
    const value = {foo: 'bar'}
    let counter = 0
    di.addFactory(name, function (c) {
      assert(c === di)
      ++counter
      return value
    })

    assert(counter === 0)
    assert(di.get(name) === value)
    assert(counter === 1)
    di.get(name)
    assert(counter === 1)
  })

  it('should call factory function, if called create', function () {
    const name = 'my.factory.function'
    const values = [{foo: 'bar'}, {bar: 'baz'}]
    let counter = 0
    di.addFactory(name, function (c) {
      assert(c === di)
      return values[counter++]
    }, {createEveryTime: true})

    assert(di.create(name) === values[0])
    assert(di.create(name) === values[1])
  })

  it('should call factory function, if marked as createEveryTime', function () {
    const name = 'my.factory.function'
    const values = [{foo: 'bar'}, {bar: 'baz'}]
    let counter = 0
    di.addFactory(name, function (c) {
      assert(c === di)
      return values[counter++]
    }, {createEveryTime: true})

    assert(di.get(name) === values[0])
    assert(di.get(name) === values[1])
  })

  it('should work with simple class definition', function () {
    const value = 'test'
    di.addClass('foo', FooClass, {constructorArguments: [value]})
    /** @type {FooClass} */
    const foo = di.get('foo')
    assert(foo instanceof FooClass)
    assert(foo.arg === value)
  })

  it('should work with named arguments', function () {
    const value = 'test'
    di.addClass('foo', FooClass, {constructorArguments: {arg2: value}})
    /** @type {FooClass} */
    const foo = di.get('foo')
    assert(foo instanceof FooClass)
    assert(foo.arg2 === value)
  })

  it('should work with class links', function () {
    di.addClass('foo', FooClass)
    di.addClass('bar', BarClass, {constructorArguments: ['@foo']})
    /** @type {BarClass} */
    const bar = di.get('bar')
    assert(bar instanceof BarClass)
    assert(bar.fooObject instanceof FooClass)
    assert(bar.fooObject === di.get('foo'))
  })

  it('should create new obj if called create', function () {
    di.addClass('foo', FooClass)
    const foo1 = di.create('foo')
    const foo2 = di.create('foo')
    assert(foo1 instanceof FooClass)
    assert(foo2 instanceof FooClass)
    assert(foo1 !== foo2)
  })

  it('should create new obj if class marked as createEveryTime', function () {
    di.addClass('foo', FooClass, {createEveryTime: true})
    const foo1 = di.get('foo')
    const foo2 = di.get('foo')
    assert(foo1 instanceof FooClass)
    assert(foo2 instanceof FooClass)
    assert(foo1 !== foo2)
  })
})
