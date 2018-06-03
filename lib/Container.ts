import {ContainerInterface, Definition, Options} from "./ContainerInterface";
import {
    AlreadyDefinedException,
    CreateNotCallableException,
    NotAClassException,
    NotAFunctionException,
    NotFoundException
} from "./Exception";

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
            case Definition.Types.Factory:
                result = (definition as Definition.Factory).factory(this);
                break;
            case Definition.Types.Class:
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
        add.call(this, id, {type: Definition.Types.Scalar, value});
        this._created[id] = value;

        return this
    }

    addFactory(id: string, factory: (container: ContainerInterface) => any, options?: Options.Factory): this {
        if (typeof factory !== 'function') {
            throw new NotAFunctionException()
        }

        options || (options = {});
        add.call(this, id, {type: Definition.Types.Factory, factory, options});
        return this
    }

    addClass(id: string, constructor: { new(): any }, options?: Options.Class): this {
        if (!constructor || !constructor.prototype || !constructor.prototype.constructor) {
            throw new NotAClassException()
        }

        options || (options = {});
        add.call(this, id, {type: Definition.Types.Class, constructor, options});
        return this
    }
}
