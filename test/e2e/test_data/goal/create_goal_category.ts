import createBase = require('../create_base');
import createGeneric = require('../generic/create_generic');
import createGoal = require('../goal/create_goal');
import dataApi = require('../data_api');
import dataBuilder = require('../data_builder');

export class CreateGoalCategory<T extends createBase.CreateBase> extends createGeneric.CreateGeneric<T> {

  goal({resultName, overrides}: createBase.IArgs = {}) {
    let goal = dataBuilder.generateGoal(overrides);
    goal.parentSubDocId = this._getData().subDocId;
    let dataRecord = this._createDataRecord('goal', resultName);
    dataApi.createGoal(goal, this._adminAuth, dataRecord.callback);
    return new createGoal.CreateGoal(this, dataRecord);
  }

  delete() {
    let cmd = 'deleteCategory';
    let dataRecord = this._createDataRecord(cmd);
    dataApi.deleteGoal(this._getData().subDocId, cmd, this._adminAuth, dataRecord.callback);
    return this;
  }

}
