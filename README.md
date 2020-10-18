# just-another-di
[![npm version][npm-version-shield]][npm-version-link]
[![npm downloads][npm-downloads-shield]][npm-downloads-link]
[![Build Status][travis-shield]][travis-link]
[![Coverage Status][coveralls-shield]][coveralls-link]

Just another one implementation of di container for Javascript - TypeScript / Node.js

## Features

## Installing

Using npm:

```bash
$ npm install just-another-di
```

Using yarn:

```bash
$ yarn add just-another-di
```

## Usage examples
### NodeJS
```javascript
const { Container } = require('just-another-di');
function FooClass (arg, arg2) {
    this.arg = arg;
    this.arg2 = arg2;
}

// Initialize new Container object
const di = new Container;
di.set('my.var', 'My awesome string');
di.get('my.var'); // Will return 'My awesome string' value

let factoryCounter = 0;
di.set('fooObj', function (c) {
    return new FooClass('Counter = ' + (factoryCounter++), c.get('my.var'))
}, {createEveryTime: false}); // Default value for createEveryTime option
// If option createEveryTime will be true,
// di.get('fooObj') will return new result of function call

di.get('fooObj'); // Will return object#1 
// instanceof FooClass with props:
// {arg: 'Counter = 0', arg2: 'My awesome string'}
di.get('fooObj', true); // Will return object#2
// instanceof FooClass with props:
// {arg: 'Counter = 1', arg2: 'My awesome string'}
di.get('fooObj'); // Will return object#2
// instanceof FooClass with props:
// {arg: 'Counter = 1', arg2: 'My awesome string'}
// Because container memorize only last result of creation
```
### Typescript
```typescript
import {Container} from 'just-another-di';

class FooClass {
    private arg: any;
    private arg2: any;

    constructor(arg: any, arg2: any) {
        this.arg = arg;
        this.arg2 = arg2;
    }
}

// Initialize new Container object
const di = new Container;
di.set('my.var', 'My awesome string');
di.get('my.var'); // Will return 'My awesome string' value

let factoryCounter = 0;
di.set('fooObj', function (c: Container) {
    return new FooClass('Counter = ' + (factoryCounter++), c.get('my.var'))
}, {createEveryTime: false}); // Default value for createEveryTime option
// If option createEveryTime will be true,
// di.get('fooObj') will return new result of function call

di.get('fooObj'); // Will return object#1 
// instanceof FooClass with props:
// {arg: 'Counter = 0', arg2: 'My awesome string'}
di.set('fooObj', true); // Will return object#2
// instanceof FooClass with props:
// {arg: 'Counter = 1', arg2: 'My awesome string'}
di.get('fooObj'); // Will return object#2
// instanceof FooClass with props:
// {arg: 'Counter = 1', arg2: 'My awesome string'}
// Because container memorize only last result of creation
```
## API description
Module returns Container class, that must be initiated for usage

**Javascript**:
```javascript
const { Container } = require('just-another-di');
const di = new Container;
```

**Typescript**:
```typescript
import Container from 'just-another-di';
const di = new Container;
```

Next you can use on of following methods to define values:

**set( name: string, value: any, options?: {createEveryTime: false} )** -
 define factory lambda function, for object initialization.
Container will execute function on demand (di.get(name)),
memorize result of execution (createEveryTime !== true),
then will return execution result;
if typeof value is a scalar Container will return it unchanged on demand;

## Semver
Until di reaches a `1.0` release,
breaking changes will be released with a new minor version.

## License
MIT


[npm-version-shield]: https://img.shields.io/npm/v/just-another-di.svg?style=for-the-badge
[npm-version-link]: https://www.npmjs.org/package/just-another-di
[npm-downloads-shield]: https://img.shields.io/npm/dm/just-another-di?style=for-the-badge
[npm-downloads-link]: https://www.npmjs.org/package/just-another-di
[travis-shield]: https://img.shields.io/travis/Bolid1/just-another-di?style=for-the-badge
[travis-link]: https://travis-ci.org/Bolid1/just-another-di
[coveralls-shield]: https://img.shields.io/coveralls/github/Bolid1/just-another-di?style=for-the-badge
[coveralls-link]: https://coveralls.io/github/Bolid1/just-another-di
