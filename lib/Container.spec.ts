import {Container} from './Container';
import {expect} from 'chai';
import 'mocha';

class FooClass {
    private arg: any;
    private arg2: any;

    constructor(arg, arg2) {
        this.arg = arg;
        this.arg2 = arg2;
    }
}

class BarClass {
    private fooObject: FooClass;

    constructor(fooObject) {
        this.fooObject = fooObject;
    }
}

describe('Hello function', () => {
    let di;

    beforeEach(function () {
        di = new Container()
    });

    it('should keep scalar value', () => {
        const value = 123;
        di.addScalar('my.value', value);
        expect(di.get('my.value')).to.equal(value);
    });

    it('should throw error if called create on scalar', function () {
        const value = 123;
        let error = false;
        di.addScalar('my.value', value);
        try {
            di.create('my.value')
        } catch (ex) {
            error = ex
        }

        expect(error).to.not.be.false;
    });

    it('should throw error if try to override value by id', () => {
        let error = false;

        di.addScalar('my.value', 123);
        try {
            di.addScalar('my.value', 456);
        } catch (ex) {
            error = ex
        }

        expect(error).to.not.be.false;
    });

    it('should throw error if value by id not set', () => {
        let error = false;

        try {
            di.get('my.value');
        } catch (ex) {
            error = ex
        }

        expect(error).to.not.be.false;
    });

    it('should work with factory function', function () {
        const name = 'my.factory.function';
        const value = {foo: 'bar'};
        let counter = 0;
        di.addFactory(name, function (c) {
            expect(c).to.equal(di);
            ++counter;
            return value
        });

        expect(counter).to.equal(0);
        expect(di.get(name)).to.equal(value);
        expect(counter).to.equal(1);
        di.get(name);
        expect(counter).to.equal(1)
    });

    it('should call factory function, if called create', function () {
        const name = 'my.factory.function';
        const values = [{foo: 'bar'}, {bar: 'baz'}];
        let counter = 0;
        di.addFactory(name, function (c) {
            expect(c).to.equal(di);
            return values[counter++]
        }, {createEveryTime: true});

        expect(di.create(name)).to.equal(values[0]);
        expect(di.create(name)).to.equal(values[1])
    });

    it('should call factory function, if marked as createEveryTime', function () {
        const name = 'my.factory.function';
        const values = [{foo: 'bar'}, {bar: 'baz'}];
        let counter = 0;
        di.addFactory(name, function (c) {
            expect(c).to.equal(di);
            return values[counter++]
        }, {createEveryTime: true});

        expect(di.get(name)).to.equal(values[0]);
        expect(di.get(name)).to.equal(values[1])
    });

    it('should throw error if provide not function to factory', () => {
        let error = false;

        try {
            di.addFactory('test', 'some scalar');
        } catch (ex) {
            error = ex
        }

        expect(error).to.not.be.false;
    });

    it('should work with simple class definition', function () {
        const value = 'test';
        di.addClass('foo', FooClass, {constructorArguments: [value]});
        /** @type {FooClass} */
        const foo = di.get('foo');
        expect(foo).to.be.an.instanceof(FooClass);
        expect(foo.arg).to.equal(value)
    });

    it('should work with named arguments', function () {
        const value = 'test';
        di.addClass('foo', FooClass, {constructorArguments: {arg2: value}});
        /** @type {FooClass} */
        const foo = di.get('foo');
        expect(foo).to.be.an.instanceof(FooClass);
        expect(foo.arg2).to.equal(value)
    });

    it('should work with class links', function () {
        di.addClass('foo', FooClass);
        di.addClass('bar', BarClass, {constructorArguments: ['@foo']});
        /** @type {BarClass} */
        const bar = di.get('bar');
        expect(bar).to.be.an.instanceof(BarClass);
        expect(bar.fooObject).to.equal(di.get('foo'))
    });

    it('should create new obj if called create', function () {
        di.addClass('foo', FooClass);
        const foo1 = di.create('foo');
        const foo2 = di.create('foo');
        expect(foo1).to.be.an.instanceof(FooClass);
        expect(foo2).to.be.an.instanceof(FooClass);
        expect(foo1).to.be.not.eq(foo2)
    });

    it('should create new obj if class marked as createEveryTime', function () {
        di.addClass('foo', FooClass, {createEveryTime: true});
        const foo1 = di.get('foo');
        const foo2 = di.get('foo');
        expect(foo1).to.be.an.instanceof(FooClass);
        expect(foo2).to.be.an.instanceof(FooClass);
        expect(foo1).to.be.not.eq(foo2)
    });

    it('should throw error if provide not class definition to class', () => {
        let error = false;

        try {
            di.addClass('test', {});
        } catch (ex) {
            error = ex
        }

        expect(error).to.not.be.false;
    });
});