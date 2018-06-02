/**
 * @implements {JustAnotherDi.ContainerExceptionInterface}
 * @memberOf {JustAnotherDi}
 */
export class ContainerException extends Error {
}

/**
 * @implements {JustAnotherDi.AlreadyDefinedExceptionInterface}
 * @memberOf {JustAnotherDi}
 */
export class AlreadyDefinedException extends ContainerException {
}

/**
 * @implements {JustAnotherDi.NotFoundExceptionInterface}
 * @memberOf {JustAnotherDi}
 */
export class NotFoundException extends ContainerException {
}

/**
 * @implements {JustAnotherDi.CreateNotCallableExceptionInterface}
 * @memberOf {JustAnotherDi}
 */
export class CreateNotCallableException extends ContainerException {
}

/**
 * @implements {JustAnotherDi.NotAFunctionExceptionInterface}
 * @memberOf {JustAnotherDi}
 */
export class NotAFunctionException extends ContainerException {
}

/**
 * @implements {JustAnotherDi.NotAClassExceptionInterface}
 * @memberOf {JustAnotherDi}
 */
export class NotAClassException extends ContainerException {
}

/**
 * @param id
 * @param definition
 * @this {Container}
 */
function add (id, definition) {
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
function createClass (constructor, constructorArguments) {
  constructorArguments.unshift(constructor)
  const bound = (Function.prototype.bind.apply(constructor, constructorArguments))

  return new bound
}

/**
 * @param cls
 * @returns {Array}
 */
function extractArguments (cls) {
  const matches = cls.prototype.constructor.toString().match(/function \(([^\)]*)\)/)

  if (!matches || !Array.isArray(matches) || !matches[1]) {
    return []
  }

  const match = matches[1].replace(/\s/g, '')

  return match.length ? match.split(',') : []
}

/**
 * @param cls
 * @param {*} args
 * @this {Container}
 */
function resolveConstructorArguments (cls, args) {
  let result

  switch (true) {
    case Array.isArray(args):
      result = args
      break
    case typeof args === 'object':
      result = extractArguments(cls).map((key) => {
        return args.hasOwnProperty(key) ? args[key] : undefined
      })
      break
    default:
      result = []
      break
  }

  return result.map((arg) => {
    if (typeof arg === 'string' && arg.substr(0, 1) === '@') {
      return this.get(arg.substr(1))
    }

    return arg
  })
}

const DEFINITION_TYPE_SCALAR = 'scalar'
const DEFINITION_TYPE_FACTORY = 'factory'
const DEFINITION_TYPE_CLASS = 'class'

/**
 * @implements {JustAnotherDi.ContainerInterface}
 * @memberOf {JustAnotherDi}
 */
export class Container {
  constructor () {
    /**
     * @type {Object.<string, JustAnotherDi.Definition>}
     * @private
     */
    this._definitions = {}
    /**
     * @type {Object.<string, *>}
     * @private
     */
    this._created = {}
  }

  has (id) {
    return this._definitions.hasOwnProperty(id)
  }

  /**
   * @param {string} id
   * @returns {JustAnotherDi.Definition|JustAnotherDi.ScalarDefinition|JustAnotherDi.ClassDefinition|JustAnotherDi.FactoryDefinition}
   */
  getDefinition (id) {
    if (!this.has(id)) {
      throw new NotFoundException()
    }

    return this._definitions[id]
  }

  get (id) {
    if (this._created.hasOwnProperty(id)) {
      return this._created[id]
    }

    return this.create(id)
  }

  create (id) {
    let result
    const definition = this.getDefinition(id)

    switch (definition.type) {
      case DEFINITION_TYPE_FACTORY:
        result = definition.factory(this)
        break
      case DEFINITION_TYPE_CLASS:
        result = createClass.call(
          this,
          definition.constructor,
          resolveConstructorArguments.call(this, definition.constructor, definition.options.constructorArguments)
        )
        break
      default:
        throw new CreateNotCallableException()
    }

    if (!definition.options.hasOwnProperty('createEveryTime') || !definition.options.createEveryTime) {
      this._created[id] = result
    }

    return result
  }

  addScalar (id, value) {
    add.call(this, id, {type: DEFINITION_TYPE_SCALAR, value})
    this._created[id] = value

    return this
  }

  addFactory (id, factory, options) {
    if (typeof factory !== 'function') {
      throw new NotAFunctionException()
    }

    options || (options = {})
    add.call(this, id, {type: DEFINITION_TYPE_FACTORY, factory, options})
    return this
  }

  addClass (id, constructor, options) {
    if (!constructor || !constructor.prototype || !constructor.prototype.constructor) {
      throw new NotAClassException()
    }

    options || (options = {})
    add.call(this, id, {type: DEFINITION_TYPE_CLASS, constructor, options})
    return this
  }
}

export default Container
