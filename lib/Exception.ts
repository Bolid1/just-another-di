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