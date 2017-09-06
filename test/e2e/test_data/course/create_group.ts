import createBase = require('../create_base');
import createCourse = require('../course/create_course');
import createGeneric = require('../generic/create_generic');
import dataApi = require('../data_api');
import dataBuilder = require('../data_builder');

export class CreateGroup<T extends createCourse.CreateCourse<createBase.CreateBase>> extends createGeneric.CreateGeneric<T> {

  /**
   * Update memberships of this group.
   * @param input Optional Students or number of students in each group.
   */
  memberships(students: any[]): CreateGroup<T>;
  memberships(number: number): CreateGroup<T>;
  memberships(input: any) {
    let memberships: any[] = [];
    let students: any[] = [];
    if (typeof input === 'number') {
      let number: number = input;
      let createCourse = this.parent;
      for (let i = 0; i < number; i++) {
        let student = createCourse.student();
        memberships.push({ userId: student._getData().id });
        students.push(student._getData());
      }
    } else if (Array.isArray(input)) {
      students = input;
      memberships = students.map(student => ({userId: student.id}));
    } else {
      throw new Error('Invalid input!');
    }

    let course = this.parent._getData();
    let group = this._getData();

    let dataRecord = this._createDataRecord('groupMemberships');

    dataApi.updateGroup({ memberships: memberships, groupId: group.id, courseId: course.id }, this._adminAuth, dataRecord.callback);
    this._resolveDataRecord(dataRecord);
    group.memberships = memberships;
    group.students = students;

    return this;
  }
}
