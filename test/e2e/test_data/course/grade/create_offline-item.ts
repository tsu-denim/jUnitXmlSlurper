import createBase = require('../../create_base');
import createGeneric = require('../../generic/create_generic');
import dataApi = require('../../data_api');
import dataBuilder = require('../../data_builder');

export class CreateOfflineItem<T extends createBase.CreateBase> extends createGeneric.CreateGeneric<T> {

  grade(args: { from: string; to: string; postGrade?: boolean; resultName?: string; overrides?: any }) {
    var column = this._getData();
    var course = this._resolve('course');
    var from = this._resolve(args.from);
    var to =  this._resolve(args.to);
    var postGrade = args.postGrade;

    var dataRecord = this._createDataRecord('offlineItemGrade', args && args.resultName);
    var grade = dataBuilder.generateGradeDetail(args.overrides);
    dataApi.gradeGradeItem({
      courseId: course.id,
      columnId: column.id,
      userId: to.id,
      postGrade: postGrade,
      grade: grade
    }, from, dataRecord.callback);

    return new createGeneric.CreateGeneric(this, dataRecord);
  }
}