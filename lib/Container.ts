/**
 * Describes the interface of a container that exposes methods to read its entries
 */
export interface PsrContainerInterface {
    /**
     * Finds an entry of the container by its identifier and returns it
     *
     * @param {string} id
     *
     * @throws NotFoundExceptionInterface  No entry was found for **this** identifier.
     * @throws ContainerExceptionInterface Error while retrieving the entry.
     *
     * @returns {*}
     */
    get(id: string): any

    /**
     * Returns true if the container can return an entry for the given identifier.
     * Returns false otherwise.
     *
     * `has(id)` returning true does not mean that `get(id)` will not throw an exception.
     * It does however mean that `get(id)` will not throw a `NotFoundExceptionInterface`.
     *
     * @param {string} id Identifier of the entry to look for.
     *
     * @throws NotFoundExceptionInterface  No entry was found for **this** identifier.
     * @throws ContainerExceptionInterface Error while retrieving the entry.
     *
     * @returns {boolean}
     */
    has(id: string): boolean
}

/**
 * Base interface representing a generic exception in a container
 */
export interface ContainerExceptionInterface extends Error {
}

/**
 * No entry was found in the container
 */
export interface NotFoundExceptionInterface extends ContainerExceptionInterface {
}

/**
 * Entry with the same id already defined
 */
export interface AlreadyDefinedExceptionInterface extends ContainerExceptionInterface {
}

/**
 * Entry is not callable, so we can't create object with it
 */
export interface CreateNotCallableExceptionInterface extends ContainerExceptionInterface {
}

/**
 * Is not a valid function in arguments
 */
export interface NotAFunctionExceptionInterface extends ContainerExceptionInterface {
}

/**
 * Is not a valid class in arguments
 */
export interface NotAClassExceptionInterface extends ContainerExceptionInterface {
}

export namespace Options {
    export interface Factory {
        createEveryTime?: boolean
    }

    export interface Class extends Factory {
        constructorArguments?: void | any[] | string[]
    }
}

export namespace Definition {
    export interface Definition {
        type: string
    }

    export interface Scalar extends Definition {
        value: any
    }

    export interface Factory extends Definition {
        factory: (container: ContainerInterface) => any
        options: Options.Factory
    }

    export interface Class extends Definition {
        constructor: new () => any
        options: Options.Class
    }
}

export interface ContainerInterface extends PsrContainerInterface {
    getDefinition(id: string): Definition.Scalar | Definition.Factory | Definition.Class

    create(id: string): any

    addScalar(id: string, value: any): this

    addFactory(
        id: string,
        factory: (container: ContainerInterface) => any,
        options?: Options.Factory
    ): this

    addClass(
        id: string,
        constructor: new () => any,
        options?: Options.Class
    ): this
}

export class ContainerException extends Error implements ContainerExceptionInterface {
}

export class AlreadyDefinedException extends ContainerException implements AlreadyDefinedExceptionInterface {
}

export class NotFoundException extends ContainerException implements NotFoundExceptionInterface {
}

export class CreateNotCallableException extends ContainerException implements CreateNotCallableExceptionInterface {
}

export class NotAFunctionException extends ContainerException implements NotAFunctionExceptionInterface {
}

export class NotAClassException extends ContainerException implements NotAClassExceptionInterface {
}

export const DEFINITION_TYPE_SCALAR = 'scalar';
export const DEFINITION_TYPE_FACTORY = 'factory';
export const DEFINITION_TYPE_CLASS = 'class';


/**
 * @param id
 * @param definition
 * @this {Container}
 */
function add(id, definition) {
    if (this.has(id)) {
        throw new AlreadyDefinedException()
    }

    this._definitions[id] = definition
}

/**
 * @param constructor
 * @param {Array} constructorArguments
 * @this {Container}
 */
function createClass(constructor, constructorArguments) {
    constructorArguments.unshift(constructor);
    const bound = (Function.prototype.bind.apply(constructor, constructorArguments));

    return new bound
}

/**
 * @param cls
 * @returns {Array}
 */
function extractArguments(cls) {
    const matches = cls.prototype.constructor.toString().match(/function\s+[^(]*\(([^)]*)\)/);
    let result = [];

    if ((matches && Array.isArray(matches) && matches[1])) {
        const match = String(matches[1]).replace(/\s/g, '');
        result = match.length ? match.split(',') : [];
    }


    return result;
}

/**
 * @param cls
 * @param {*} args
 * @this {Container}
 */
function resolveConstructorArguments(cls, args) {
    let result;

    switch (true) {
        case Array.isArray(args):
            result = args;
            break;
        case typeof args === 'object':
            result = extractArguments(cls).map((key) => {
                return args.hasOwnProperty(key) ? args[key] : undefined
            });
            break;
        default:
            result = [];
            break
    }

    return result.map((arg) => {
        if (typeof arg === 'string' && arg.substr(0, 1) === '@') {
            return this.get(arg.substr(1))
        }

        return arg
    })
}

export class Container implements ContainerInterface {
    private readonly _definitions: {};
    private readonly _created: {};

    constructor() {
        this._definitions = {};
        this._created = {};
    }

    has(id: string): boolean {
        return this._definitions.hasOwnProperty(id)
    }

    getDefinition(id: string): Definition.Scalar | Definition.Class | Definition.Factory {
        if (!this.has(id)) {
            throw new NotFoundException()
        }

        return this._definitions[id]
    }

    get(id: string): any {
        if (this._created.hasOwnProperty(id)) {
            return this._created[id]
        }

        return this.create(id)
    }

    create(id: string): any {
        let result;
        const definition = this.getDefinition(id);

        switch (definition.type) {
            case DEFINITION_TYPE_FACTORY:
                result = (definition as Definition.Factory).factory(this);
                break;
            case DEFINITION_TYPE_CLASS:
                result = createClass.call(
                    this,
                    definition.constructor,
                    resolveConstructorArguments.call(
                        this,
                        definition.constructor,
                        (definition as Definition.Class).options.constructorArguments
                    )
                );
                break;
            default:
                throw new CreateNotCallableException()
        }

        if (
            !this._created.hasOwnProperty(id)
            && (!(definition as Definition.Class | Definition.Factory).options.hasOwnProperty('createEveryTime')
            || !(definition as Definition.Class | Definition.Factory).options.createEveryTime)
        ) {
            this._created[id] = result
        }

        return result
    }

    addScalar(id: string, value: any): this {
        add.call(this, id, {type: DEFINITION_TYPE_SCALAR, value});
        this._created[id] = value;

        return this
    }

    addFactory(id: string, factory: (container: ContainerInterface) => any, options?: Options.Factory): this {
        if (typeof factory !== 'function') {
            throw new NotAFunctionException()
        }

        options || (options = {});
        add.call(this, id, {type: DEFINITION_TYPE_FACTORY, factory, options});
        return this
    }

    addClass(id: string, constructor: { new(): any }, options?: Options.Class): this {
        if (!constructor || !constructor.prototype || !constructor.prototype.constructor) {
            throw new NotAClassException()
        }

        options || (options = {});
        add.call(this, id, {type: DEFINITION_TYPE_CLASS, constructor, options});
        return this
    }
}
