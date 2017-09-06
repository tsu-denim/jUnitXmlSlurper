import _ = require('lodash');
import create = require('../../create');
import createBase = require('../../create_base');
import createGeneric = require('../../generic/create_generic');
import dataApi = require('../../data_api');

export class CreateContent<T extends createBase.CreateBase> extends createGeneric.CreateGeneric<T> {

  alignGoals(goals: dataApi.IGoal[]) {
    let dataRecord = this._createDataRecord('alignedGoals');
    this._getData().alignedGoals = goals.map(goal => ({goalId: goal.stdId, isVisibleToStudent: true}));
    dataApi.patchContent({
      url: this._getData().url,
      body: this._getData(),
      qs: {expand: 'alignedGoals'}
    }, this._adminAuth, dataRecord.callback);
    this._dataRecord.value = this._resolveDataRecord(dataRecord);
    return this;
  }

  assignGroups(groups: any[]) {
    let dataRecord = this._createDataRecord('assignedGroups');
    this._getData().assignedGroups = groups.map(group => ({groupId: group.id}));
    this._getData().isGroupContent = true;
    dataApi.patchContent({
      url: this._getData().url,
      body: this._getData(),
      qs: {expand: 'assignedGroups'}
    }, this._adminAuth, dataRecord.callback);
    this._dataRecord.value = this._resolveDataRecord(dataRecord);
    return this;
  }

}