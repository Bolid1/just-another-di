import {Container} from './Container';
import {expect} from 'chai';
import 'mocha';

describe('Hello function', () => {
    let di;

    beforeEach(function () {
        di = new Container()
    });

    it('should keep scalar value', () => {
        const value = 123;
        di.set('my.value', value);
        expect(di.get('my.value')).to.equal(value);
    });

    it('should throw error if try to override value by id', () => {
        let error = false;

        di.set('my.value', 123);
        try {
            di.set('my.value', 456);
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

    it('should not throw error if value by id was unset', () => {
        let error = false;

        di.set('my.value', 123);
        di.unset('my.value');
        di.set('my.value', 456);

        expect(error).to.be.false;
    });

    it('should work with factory function', function () {
        const name = 'my.factory.function';
        const value = {foo: 'bar'};
        let counter = 0;
        di.set(name, function (c) {
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

    it('should call factory function, if called with forceRecreate flag', function () {
        const name = 'my.factory.function';
        const values = [{foo: 'bar'}, {bar: 'baz'}];
        let counter = 0;
        di.set(name, function (c) {
            expect(c).to.equal(di);
            return values[counter++]
        }, {createEveryTime: false});

        expect(di.get(name, true)).to.equal(values[0]);
        expect(di.get(name, true)).to.equal(values[1])
    });

    it('should use default createEveryTime value if options with broken type', function () {
        const name = 'my.factory.function';
        const value = {foo: 'bar'};
        let counter = 0;
        di.set(name, function (c) {
            ++counter;
            expect(c).to.equal(di);
            return value
        }, null);

        expect(counter).to.equal(0);
        expect(di.get(name)).to.equal(value);
        expect(counter).to.equal(1);
        di.get(name);
        expect(counter).to.equal(1)
    });

    it('should use default createEveryTime value if options without some values', function () {
        const name = 'my.factory.function';
        const value = {foo: 'bar'};
        let counter = 0;
        di.set(name, function (c) {
            ++counter;
            expect(c).to.equal(di);
            return value
        }, {foo: 'bar'});

        expect(counter).to.equal(0);
        expect(di.get(name)).to.equal(value);
        expect(counter).to.equal(1);
        di.get(name);
        expect(counter).to.equal(1)
    });

    it('should call factory function, if marked as createEveryTime', function () {
        const name = 'my.factory.function';
        const values = [{foo: 'bar'}, {bar: 'baz'}];
        let counter = 0;
        di.set(name, function (c) {
            expect(c).to.equal(di);
            return values[counter++]
        }, {createEveryTime: true});

        expect(di.get(name)).to.equal(values[0]);
        expect(di.get(name)).to.equal(values[1])
    });
});