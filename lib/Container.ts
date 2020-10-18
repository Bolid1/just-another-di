/**
 * Generic exception in a container
 */
export class ContainerException {}

/**
 * Entry with the same id already defined
 */
export class AlreadyDefinedException extends ContainerException {}

/**
 * No entry was found in the container
 */
export class NotFoundException extends ContainerException {}

/**
 * Container element definition.
 * By extending this class you can provider more flexible
 * solutions for container.
 * Main purpose of this class - compile
 */
export class ContainerDefinition {
  private readonly _value: any;
  private _result: any;
  private _optionsPrepared: boolean;

  constructor(value: any, options: ContainerValueOptions) {
    this._value = value;
    this._options = options;
    this._result = undefined;
  }

  private _options: ContainerValueOptions;

  protected get options(): ContainerValueOptions {
    if (!this._optionsPrepared) {
      this.buildOptions();
    }

    return this._options;
  }

  protected get isFactory(): boolean {
    return typeof this._value === "function";
  }

  public compile(c: Container): any {
    if (this._result !== undefined && this.options.createEveryTime !== true) {
      return this._result;
    }

    return (this._result = this.build(c));
  }

  public clearResult(c: Container): any {
    this._result = undefined;
  }

  protected build(c: Container): any {
    return this.isFactory ? this._value(c, this.options) : this._value;
  }

  protected buildOptions(): void {
    if (!this._options || typeof this._options !== "object") {
      this._options = defaultValueOptions;
    }

    Object.keys(defaultValueOptions).forEach((key) => {
      if (!Object.prototype.hasOwnProperty.apply(this._options, key)) {
        this._options[key] = defaultValueOptions[key];
      }
    });

    this._optionsPrepared = true;
  }
}

/**
 *
 */
export interface ContainerValueOptions {
  createEveryTime?: boolean;
}

export const defaultValueOptions: ContainerValueOptions = {
  createEveryTime: false,
};

/**
 *
 */
export interface ContainerOptions {
  defaultDefinition?: typeof ContainerDefinition;
}

export const defaultOptions: ContainerOptions = {
  defaultDefinition: ContainerDefinition,
};

export class Container {
  private readonly _definitions: { [id: string]: ContainerDefinition };
  private readonly _defaultDefinition: typeof ContainerDefinition;

  constructor(options: ContainerOptions = defaultOptions) {
    this._definitions = {};
    this._defaultDefinition = options.defaultDefinition || ContainerDefinition;
  }

  /**
   * Returns true if the container can return an entry for the given identifier.
   * Returns false otherwise.
   *
   * `has(id)` returning true does not mean that `get(id)` will not throw an exception.
   * It does however mean that `get(id)` will not throw a `NotFoundException`.
   *
   * @param {string} id Identifier of the entry to look for.
   *
   * @throws NotFoundException  No entry was found for **this** identifier.
   * @throws ContainerException Error while retrieving the entry.
   *
   * @returns {boolean}
   */
  has(id: string): boolean {
    return Object.prototype.hasOwnProperty.apply(this._definitions, id);
  }

  /**
   * Finds an entry of the container by its identifier and returns it
   *
   * @param {string} id
   * @param {boolean} forceRecreate - if you need force recompile definition
   *
   * @throws NotFoundException  No entry was found for **this** identifier.
   * @throws ContainerException Error while retrieving the entry.
   *
   * @returns {*}
   */
  get(id: string, forceRecreate = false): any {
    if (!this.has(id)) {
      throw new NotFoundException();
    }

    const definition = this._definitions[id];

    if (forceRecreate) {
      definition.clearResult(this);
    }

    return definition.compile(this);
  }

  /**
   * Define entry in container with its identifier.
   *
   * @param {string} id
   * @param {ContainerDefinition} definition
   *
   * @returns {self}
   */
  define(id: string, definition: ContainerDefinition): this {
    if (this.has(id)) {
      throw new AlreadyDefinedException();
    }

    this._definitions[id] = definition;

    return this;
  }

  /**
   * Simple proxy
   *
   * @param {string} id
   * @param {*} value
   * @param {ContainerValueOptions} options
   * @returns {self}
   */
  set(
    id: string,
    value: any,
    options: ContainerValueOptions = defaultValueOptions
  ): this {
    return this.define(id, new this._defaultDefinition(value, options));
  }

  unset(id: string): void {
    delete this._definitions[id];
  }
}

export default Container;
