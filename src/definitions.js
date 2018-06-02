/**
 * @abstract
 */
class Definition {
    /**
     * @param {string} id
     */
    constructor(id) {
        this._id = id;
    }

    /**
     * @returns {string}
     */
    get id() {
        return this._id;
    }

    /**
     * Each subclass must declare his type
     *
     * @abstract
     *
     * @returns {string}
     */
    get type () {
        throw new Error('Type must be defined');
    }
}

export const TYPE_MODULE = 'module';

/**
 * Defines module definition
 */
export class ModuleDefinition extends Definition {
    get type() {
        return TYPE_MODULE;
    }
}
