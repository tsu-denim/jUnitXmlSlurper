import createBase = require('../create_base');
import createGeneric = require('../generic/create_generic');
import createGoalCategory = require('../goal/create_goal_category');
import dataApi = require('../data_api');
import dataBuilder = require('../data_builder');

export class CreateGoalSet<T extends createBase.CreateBase> extends createGeneric.CreateGeneric<T> {

  goalCategory({resultName, overrides}: createBase.IArgs = {}) {
    let goalCategory = dataBuilder.generateGoalCategory(overrides);
    goalCategory.docId = this._getData().docId;
    let dataRecord = this._createDataRecord('goalCategory', resultName);
    dataApi.createGoalCategory(goalCategory, this._adminAuth, dataRecord.callback);
    return new createGoalCategory.CreateGoalCategory(this, dataRecord);
  }

  delete() {
    let cmd = 'deleteDocument';
    let dataRecord = this._createDataRecord(cmd);
    dataApi.deleteGoal(this._getData().docId, cmd, this._adminAuth, dataRecord.callback);
    return this;
  }

}
