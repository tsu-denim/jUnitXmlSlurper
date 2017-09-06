/* tslint:disable:no-var-requires */
import ab = require('asyncblock');
import create = require('./create');
import dataApi = require('./data_api');
import models = require('../../../app/components/models');
var config = require(__dirname + '/../../../../../config/config.js');

export interface IEnvironment {
  [key: string]: any;

  user: any;
  users: any;

  student: any;
  students: any;

  instructor: any;
  instructors: any;

  guest: any;
  guests: any;

  group: any;
  groups: any;

  course: models.course.ILearnCourse;
  courses: models.course.ILearnCourse[];

  externalLink: models.courseContent.ILearnCourseContent;
  externalLinks: models.courseContent.ILearnCourseContent[];

  courseLink: models.courseContent.ILearnCourseContent;
  courseLinks: models.courseContent.ILearnCourseContent[];

  organization: models.course.ILearnCourse;
  organizations: models.course.ILearnCourse[];

  ftue: models.myPreference.ILearnMyPreference;
  ftues: models.myPreference.ILearnMyPreference[];

  membership: models.courseMembership.ILearnCourseMembership;
  memberships: models.courseMembership.ILearnCourseMembership[];

  /** calendarItem will always be an Array, and calendarItems an Array of Arrays because of the
   * format returned from the REST API to support recurring events
   */
  calendarItem: models.calendarItem.ILearnCalendarItem[];
  calendarItems: models.calendarItem.ILearnCalendarItem[][];

  forumAttachedToAssignment: models.courseMessage.ICourseMessage;

  assignment: models.courseContent.ILearnCourseContent;
  assignments: models.courseContent.ILearnCourseContent[];

  grade: models.gradeAttempt.ISourceGradeAttempt;
  grades: models.gradeAttempt.ISourceGradeAttempt[];

  goalSet: dataApi.IGoalSet;
  goalSets: dataApi.IGoalSet[];
  goalCategory: dataApi.IGoalCategory;
  goalCategorys: dataApi.IGoalCategory[];
  goal: dataApi.IGoal;
  goals: dataApi.IGoal[];

  offlineItem: models.gradeColumn.IGradeColumn;
  offlineItems: models.gradeColumn.IGradeColumn[];

  question: models.question.IQuestion;
  questions: models.question.IQuestion[];

  submission: models.gradeAttempt.ISourceGradeAttempt;
  submissions: models.gradeAttempt.ISourceGradeAttempt[];

  test: models.courseContent.ILearnCourseContent;
  tests: models.courseContent.ILearnCourseContent[];

  discussion: models.courseContent.ILearnCourseContent;
  discussions: models.courseContent.ILearnCourseContent[];

  document: models.courseContent.ICourseContent;
  documents: models.courseContent.ICourseContent[];

  folder: models.courseContent.ICourseContent;
  folders: models.courseContent.ICourseContent[];

  file: models.courseContent.ICourseContent;
  files: models.courseContent.ICourseContent[];

  conversation: dataApi.ILearnCourseConversation;
  conversations: dataApi.ILearnCourseConversation[];

  conversationReply: models.courseConversationMessage.ILearnCourseConversationMessage;
  conversationReplys: models.courseConversationMessage.ILearnCourseConversationMessage[];

  rubric: models.rubric.IRubric;
  rubrics: models.rubric.IRubric[];

  rubricAssociation: models.gradeColumn.ISourceGradeColumn;
  rubricAssociations: models.gradeColumn.ISourceGradeColumn[];

  rubricEvaluation: models.gradeAttempt.ISourceGradeAttempt;
  rubricEvaluations: models.gradeAttempt.ISourceGradeAttempt[];
}

export interface IDataRecord {
  resolved: boolean;
  resolve: () => any;
  value: any;
  resultName?: string;
  callback: Function;
}

export interface IArgs {
  resultName?: string;
  overrides?: any;
}

export class CreateBase {
  /** The parent instance from which this instance was created. Used to support chaining. */
  private _parent: CreateBase;

  /** Storage location for created data. "Local" stores data for the current chain, and global stores data for all chains. */
  private context = {
    local: <{ [key: string]: IDataRecord }>Object.create(null),
    global: <{ [key: string]: IDataRecord[] }>Object.create(null)
  };

  /** Used to track data record callbacks */
  private static _callbackId = 0;

  /** Allows all subclasses to get access to the root instance so they can create other types of data */
  _root: create.Create; //TODO: Make protected when linter is upgraded

  /** Credentials used to create data with the API as an admin */
  _adminAuth = config.test.e2e.learnAdminAuth; //TODO: Make protected when linter is upgraded

  constructor(existingInstance?: CreateBase, public _dataRecord?: IDataRecord) {
    if (existingInstance) {
      this._parent = existingInstance;
      this._root = existingInstance._root;

      this.context = {
        local: Object.create(null),
        global: existingInstance.context.global
      };
    }
  }

  /**
   * Creates an instance of a CreateBase (or derived) class with a particular context storage.
   * This allows objects created within a different subclass to store their results into the current class's storage, which
   * allows the values to be used later on within the current chain.
   *
   * @param toCreate A CreateBase (or derived) instance of the type to be created
   * @param contextInstance A CreateBase (or derived) instance to reuse the context from
   * @returns An instance of the same type as the toCreate argument
   * @protected
   */
  _createTypeWithContext<T extends CreateBase>(toCreate: T, contextInstance: CreateBase): T { //TODO: Make protected when linter is upgraded
    var newInstance = new (<any>toCreate).constructor(toCreate._parent);
    newInstance.context = (<any>contextInstance).context;

    return newInstance;
  }

  /**
   * Gets a callback suitable for passing to an async method. Creates a data record for the given name and stores the result
   * into the data record when complete.
   *
   * @param key The name of the data record to create
   * @param resultName An additional key under which to store the results of this data creation
   * @returns {function} The callback function
   * @protected
   */
  _createDataRecord(key: string, resultName?: string) { //TODO: Make protected when linter is upgraded
    var flow = ab.getCurrentFlow();
    var callbackId = ++CreateBase._callbackId;
    var callback = flow.add(callbackId);

    var dataRecord = <IDataRecord>{
      resolved: false,
      resolve: () => {
        return flow.wait(callbackId);
      },
      value: undefined,
      resultName: resultName,
      callback: undefined
    };

    this.context.local[key] = dataRecord;

    if (this.context.global[key] == null) {
      this.context.global[key] = [];
    }

    this.context.global[key].push(dataRecord);

    //Also store it under resultName if specified
    if (resultName) {
      this.context.local[resultName] = dataRecord;

      if (this.context.global[resultName] == null) {
        this.context.global[resultName] = [];
      }

      this.context.global[resultName].push(dataRecord);
    }

    dataRecord.callback = function() {
      dataRecord.resolved = true;
      dataRecord.value = arguments[1];

      callback.apply(this, arguments);
    };

    return dataRecord;
  }

  /**
   * Resolves a data record by name
   *
   * @param key The name of the data record to resolve
   * @returns {*} The value of the resolved data record
   * @protected
   */
  _resolve(key: string) { //TODO: Make protected when linter is upgraded
    var dataRecord = this._lookup(key);

    if (!dataRecord) {
      throw new Error('No data found with key of ' + key + '. You may need to create that type of data beforehand.');
    }

    return this._resolveDataRecord(dataRecord);
  }

  /**
   * Blocks until the data record's value is resolved and returns the value
   *
   * @param dataRecord The data record to resolve
   * @returns {any} The resolved value
   * @protected
   */
  _resolveDataRecord(dataRecord: IDataRecord) { //TODO: Make protected when linter is upgraded
    if (dataRecord.resolved) {
      return dataRecord.value;
    } else {
      return dataRecord.resolve();
    }
  }

  /**
   * Returns the data item that got created as part of creating this instance.
   *
   * @returns {*}
   * @private
   */
  _getData() {
    return this._resolveDataRecord(this._dataRecord);
  }

  /**
   * Gets a data record from current or parent contexts.
   *
   * @param key The name under which the data record was stored
   * @returns {*} The data record
   * @protected
   */
  _lookup(key: string) { //TODO: Make protected when linter is upgraded
    var curr: CreateBase = this;

    while (curr) {
      var localValue = curr.context.local[key];

      if (localValue) {
        return localValue;
      }

      curr = curr._parent;
    }
  }

  /**
   * Determines whether a data record exists in current or parent contexts. A data record will exist even if the data has not completed
   * fetching yet.
   *
   * @param key The name under which the data record was stored
   * @returns {boolean} True if the data record exists, false otherwise
   * @protected
   */
  _exists(key: string) { //TODO: Make protected when linter is upgraded
    return !!this._lookup(key);
  }

  /**
   * Waits for all data creation to complete and returns a structure containing all the created data
   *
   * @returns {IEnvironment} All the created data
   */
  exec() {
    var toReturn: IEnvironment = Object.create(null);

    Object.keys(this.context.global).forEach(key => {
      var allOfType = this.context.global[key].map((item: any) => {
        return this._resolveDataRecord(item); //Wait for all calls
      });

      toReturn[key] = allOfType[0];
      toReturn[key + 's'] = allOfType; //TODO: Find npm module to create proper plurals
    });

    return toReturn;
  }
}
