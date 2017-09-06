import _ = require('lodash');
import ab = require('asyncblock');
import createBase = require('./create_base');
import createCourse = require('./course/create_course');
import createGeneric = require('./generic/create_generic');
import createGoalSet = require('./goal/create_goal_set');
import createIpModule = require('./institution/create_institution_module');
import createUser = require('./user/create_user');
import dataBuilder = require('./data_builder');
import dataApi = require('./data_api');
import models = require('../../../app/components/models');

export class Create extends createBase.CreateBase {
  constructor() {
    super();

    this._root = this;
  }

  /**
   * Creates a user with login FTUE disabled
   *
   * @param resultName An optional name to store the created user under in the data returned from .exec()
   * @param overrides An optional object containing data that overrides the default fields generated for the user
   */
  user({resultName, overrides}: createBase.IArgs = {}) {
    var userInfo = dataBuilder.generateUser('user', overrides);
    var dataRecord = this._createDataRecord('user', resultName);
    dataApi.createUser({ user: userInfo }, this._adminAuth, dataRecord.callback);

    var user = new createUser.CreateUser(this, dataRecord);

    user.with.disabledLoginFTUE();

    return user;
  }

  /**
   * Creates a System Admin user.
   *
   * @param args.resultName An optional name to store the created user under in the data returned from .exec()
   * @param args.overrides An optional object containing data that overrides the default fields generated for the user
   */
  systemAdmin(args?: createBase.IArgs) {
    args = _.merge(args || {}, { overrides: { systemRoles: ['SYSTEM_ADMIN'] }});

    return this.user(args);
  }

  /**
   * Creates an enabled ultra course
   *
   * @param resultName An optional name to store the created course under in the data returned from .exec()
   * @param overrides An optional object containing data that overrides the default fields generated for the course
   */
  course({resultName, overrides}: createBase.IArgs = {}) {
    var courseInfo = dataBuilder.generateCourse('ULTRA', overrides);
    var dataRecord = this._createDataRecord('course', resultName);
    dataApi.createCourse({ course: courseInfo }, this._adminAuth, dataRecord.callback);

    return new createCourse.CreateCourse(this, dataRecord);
  }

  /**
   * Creates an institution page module
   *
   * @param resultName An optional name to store the created institution page module under in the data returned from .exec()
   * @param overrides An optional object containing data that overrides the default fields generated for the institution page module
   */
  ipModule({resultName, overrides}: createBase.IArgs = {}) {
    var ipModuleInfo = dataBuilder.generateIpModule(overrides);
    var dataRecord = this._createDataRecord('ipModule', resultName);
    dataApi.createIpModule({ ipModule: ipModuleInfo }, this._adminAuth, dataRecord.callback);

    return new createIpModule.CreateIpModule(this, dataRecord);
  }

  /**
   * Creates an organization
   *
   * @param resultName An optional name to store the created organization under in the data returned from .exec()
   * @param overrides An optional object containing data that overrides the default fields generated for the organization
   */
  organization({resultName, overrides}: createBase.IArgs = {}) {
    var organizationInfo = dataBuilder.generateOrganization('CLASSIC', overrides);
    var dataRecord = this._createDataRecord('organization', resultName);
    dataApi.createOrganization({ organization: organizationInfo }, this._adminAuth, dataRecord.callback);

    return new createCourse.CreateCourse(this, dataRecord);
  }

  /**
   * Create a course term
   *
   * @param resultName An optional name to store the created term under in the data returned from .exec()
   * @param overrides An optional object containing data that overrides the default fields generated for the term
   */
  term({resultName, overrides}: createBase.IArgs = {}) {
    var termInfo = dataBuilder.generateTerm(overrides);
    var dataRecord = this._createDataRecord('term', resultName);
    dataApi.createTerm({ term: termInfo }, this._adminAuth, dataRecord.callback);

    return new createGeneric.CreateGeneric(this, dataRecord);
  }

  /**
   * Creates multiple sets of data in parallel. Example:
   *
   * var env = create.all(
   *   create.user().with.enabledLoginFTUE(),
   *   create.course().with.instructor()
   * ).exec();
   *
   * @param args Multiple create statements
   * @returns {Create} A create instance (don't forget to call .exec()!)
   */
  all(...args: createBase.CreateBase[]) {
    return this;
  }

  /**
   * Create a goal set
   *
   * @param resultName An optional name to store the created goal set under in the data returned from .exec()
   * @param overrides An optional object containing data that overrides the default fields generated for the goal set
   */
  goalSet({resultName, overrides}: createBase.IArgs = {}) {
    let goalSet = dataBuilder.generateGoalSet(overrides);
    let dataRecord = this._createDataRecord('goalSet', resultName);
    dataApi.createGoalSet(goalSet, this._adminAuth, dataRecord.callback);
    return new createGoalSet.CreateGoalSet(this, dataRecord);
  }
}
