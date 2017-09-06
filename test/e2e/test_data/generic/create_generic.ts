import create = require('../create');
import createBase = require('../create_base');

/**
 * This class is used as a placeholder when we haven't created a specific subclass for a return type.
 */
export class CreateGeneric<T extends createBase.CreateBase> extends createBase.CreateBase {
  constructor(protected parent: T, dataRecord: createBase.IDataRecord) {
    super(parent, dataRecord);
  }

  get and() {
    return this.parent;
  }

  get with() {
    return this;
  }
}