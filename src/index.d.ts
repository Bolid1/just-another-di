export namespace JustAnotherDi {
  /**
   * Describes the interface of a container that exposes methods to read its entries
   */
  interface PsrContainerInterface {
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
    get (id: string): any

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
    has (id: string): boolean
  }

  /**
   * Base interface representing a generic exception in a container
   */
  interface ContainerExceptionInterface extends Error {
  }

  /**
   * No entry was found in the container
   */
  interface NotFoundExceptionInterface extends ContainerExceptionInterface {
  }

  /**
   * Entry with the same id already defined
   */
  interface AlreadyDefinedExceptionInterface extends ContainerExceptionInterface {
  }

  /**
   * Entry is not callable, so we can't create object with it
   */
  interface CreateNotCallableExceptionInterface extends ContainerExceptionInterface {
  }

  /**
   * Is not a valid function in arguments
   */
  interface NotAFunctionExceptionInterface extends ContainerExceptionInterface {
  }

  /**
   * Is not a valid class in arguments
   */
  interface NotAClassExceptionInterface extends ContainerExceptionInterface {
  }

  namespace Options {
    interface Factory {
      createEveryTime?: boolean
    }

    interface Class extends Factory {
      constructorArguments?: void | any[] | string[]
    }
  }

  interface Definition {
    type: string
  }

  interface ScalarDefinition extends Definition{
    value: any
  }

  interface ClassDefinition extends Definition{
    factory: (container: ContainerInterface) => any
    options: Options.Factory
  }

  interface FactoryDefinition extends Definition{
    constructor: new () => any
    options: Options.Class
  }

  interface ContainerInterface extends PsrContainerInterface {
    getDefinition(id: string): Definition | ScalarDefinition | ClassDefinition | FactoryDefinition

    create (id: string): any

    addScalar (id: string, value: any): this

    addFactory (
      id: string,
      factory: (container: ContainerInterface) => any,
      options?: Options.Factory = {createEveryTime: false}
    ): this

    addClass (
      id: string,
      constructor: new () => any,
      options?: Options.Class = {createEveryTime: false}
    ): this
  }
}
