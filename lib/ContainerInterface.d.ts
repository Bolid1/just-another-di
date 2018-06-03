export namespace Options {
    export interface Factory {
        createEveryTime?: boolean
    }

    export interface Class extends Factory {
        constructorArguments?: void | any[] | string[]
    }
}

export namespace Definition {
    export enum Types {
        Scalar = 'scalar',
        Factory = 'factory',
        Class = 'class',
    }

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