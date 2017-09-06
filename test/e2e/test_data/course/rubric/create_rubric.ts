import _ = require('lodash');
import ab = require('asyncblock');
import createBase = require('../../create_base');
import createGeneric = require('../../generic/create_generic');
import dataApi = require('../../data_api');
import dataBuilder = require('../../data_builder');
import enums = require('../../../controls/enums/index');
import models = require('../../../../../app/components/models');

export class CreateRubric<T extends createBase.CreateBase> extends createGeneric.CreateGeneric<T> {

  alignGoals(goals: dataApi.IGoal[], rowIndices = [0]) {
    let dataRecord = this._createDataRecord('alignedGoals');
    let alignedGoals = goals.map(goal => ({goalId: goal.stdId, isVisibleToStudent: true}));
    rowIndices.forEach(index => this._getData().rows[index].alignedGoals = alignedGoals);
    dataApi.patchContent({
      url: this._getData().url,
      body: this._getData(),
      qs: {expand: 'rows.alignedGoals'}
    }, this._adminAuth, dataRecord.callback);
    this._dataRecord.value = this._resolveDataRecord(dataRecord);
    return this;
  }

}
