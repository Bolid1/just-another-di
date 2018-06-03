import {
    AlreadyDefinedExceptionInterface,
    ContainerExceptionInterface,
    CreateNotCallableExceptionInterface,
    NotAClassExceptionInterface,
    NotAFunctionExceptionInterface,
    NotFoundExceptionInterface
} from "./ExceptionInterface";


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