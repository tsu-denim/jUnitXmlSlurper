import createBase = require('../create_base');
import createGeneric = require('../generic/create_generic');
import dataApi = require('../data_api');
import dataBuilder = require('../data_builder');

export class CreateGoal<T extends createBase.CreateBase> extends createGeneric.CreateGeneric<T> {
  constructor(parent: T, dataRecord: createBase.IDataRecord) {
    super(parent, dataRecord);
    // Data will be messed up when creating goals concurrently, should be a bug in the backend.
    // Resolve the data record immediately to make sure goals are created one by one.
    dataRecord.resolve();
  }

  delete() {
    let cmd = 'deleteStandards';
    let dataRecord = this._createDataRecord(cmd);
    dataApi.deleteGoal(this._getData().stdId, cmd, this._adminAuth, dataRecord.callback);
    return this;
  }

}
