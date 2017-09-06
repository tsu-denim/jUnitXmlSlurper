import _ = require('lodash');
import ab = require('asyncblock');
import BaseEnum from 'bb-base-enum';
import create = require('../create');
import createAssessment = require('../assessment/create-assessment');
import createBase = require('../create_base');
import createCalendar = require('../calendar/create_calendar-item');
import createContent = require('../course/content/create_content');
import createDocument = require('../course/content/create_document');
import createFolder = require('../course/content/create_folder');
import createConversation = require('../conversation/create_conversation');
import createDiscussion = require('../course/content/create_discussion');
import createGeneric = require('../generic/create_generic');
import createOfflineItem = require('../course/grade/create_offline-item');
import createOverallGrade = require('../course/grade/create_overall-grade');
import createRubric = require('../course/rubric/create_rubric');
import createUser = require('../user/create_user');
import createGroup = require('../course/create_group');
import createTargetedNotification = require('../targeted_notification/create_targeted_notification');
import dataBuilder = require('../data_builder');
import dataApi = require('../data_api');
import enums = require('../../controls/enums/index');
import models = require('../../../../app/components/models');

export class CreateCourse<T extends createBase.CreateBase> extends createGeneric.CreateGeneric<T> {

  /**
   * Enrolls a previously created user in the context as an instructor, or creates a new one if none exist already.
   * @param args.enrollee An optional key of a previously created user
   * @param args.overrides An optional object containing data that overrides the default fields generated for the user
   */
  instructor(args?: { enrollee?: string; overrides?: any }) {
    var resultName = args && args.enrollee || 'instructor';
    var role = KnownCourseRoleIdentifier.P;
    var enrollFromExistingUser = !!(args && args.enrollee);

    return this.enrollUser(resultName, role, enrollFromExistingUser, args && args.overrides);
  }

  /**
   * Enrolls a previously created user in the context as an teaching assistant, or creates a new one if none exist already.
   * @param args.enrollee An optional key of a previously created user
   * @param args.overrides An optional object containing data that overrides the default fields generated for the user
   */
  assistant(args?: { enrollee?: string; overrides?: any }) {
    var resultName = args && args.enrollee || 'assistant';
    var role = KnownCourseRoleIdentifier.T;
    var enrollFromExistingUser = !!(args && args.enrollee);

    return this.enrollUser(resultName, role, enrollFromExistingUser, args && args.overrides);
  }

  /**
   * Enrolls a previously created user in the context as a course builder, or creates a new one if none exist already.
   * @param args.enrollee An optional key of a previously created user
   * @param args.overrides An optional object containing data that overrides the default fields generated for the user
   */
  courseBuilder(args?: { enrollee?: string; overrides?: any }) {
    var resultName = args && args.enrollee || 'assistant';
    var role = KnownCourseRoleIdentifier.B;
    var enrollFromExistingUser = !!(args && args.enrollee);

    return this.enrollUser(resultName, role, enrollFromExistingUser, args && args.overrides);
  }

  /**
   * Enrolls a previously created user in the context as a grader, or creates a new one if none exist already.
   * @param args.enrollee An optional key of a previously created user
   * @param args.overrides An optional object containing data that overrides the default fields generated for the user
   */
  grader(args?: { enrollee?: string; overrides?: any }) {
    var resultName = args && args.enrollee || 'assistant';
    var role = KnownCourseRoleIdentifier.G;
    var enrollFromExistingUser = !!(args && args.enrollee);

    return this.enrollUser(resultName, role, enrollFromExistingUser, args && args.overrides);
  }

  /**
   * Enrolls a previously created user in the context as a student, or creates a new one if none exist already.
   * @param args.enrollee An optional key of a previously created user
   * @param args.overrides An optional object containing data that overrides the default fields generated for the user
   */
  student(args?: { enrollee?: string; overrides?: any; enrollmentOverrides?: any }) {
    var resultName = args && args.enrollee || 'student';
    var role = KnownCourseRoleIdentifier.S;
    var enrollFromExistingUser = !!(args && args.enrollee);

    return this.enrollUser(resultName, role, enrollFromExistingUser, args && args.overrides, args && args.enrollmentOverrides);
  }

  /**
   * Creates a number of students enrolled in the course
   * @param number The number of students to create and enroll
   */
  students(number = 2) {
    var lastStudent: any;
    for (var i = 1; i <= number; i++) {
      lastStudent = this.student({enrollee: 'student_' + i});
    }
    return lastStudent;
  }

  /**
   * Enrolls a previously created user in the context as a guest, or creates a new one if none exist already.
   * @param args.enrollee An optional key of a previously created user
   * @param args.overrides An optional object containing data that overrides the default fields generated for the user
   */
  guest(args?: { enrollee?: string; overrides?: any }) {
    var resultName = args && args.enrollee || 'guest';
    var role = KnownCourseRoleIdentifier.U;
    var enrollFromExistingUser = !!(args && args.enrollee);

    return this.enrollUser(resultName, role, enrollFromExistingUser, args && args.overrides);
  }

  /**
   * Create a group for the course
   * @param args.groupName An optional key of the group
   * @param args.overrides An optional object containing data that overrides the default fields generated for the group
   */
  group(args?: { groupName?: string; overrides?: any }) {
    var course = this._resolve('course'),
        courseId = course.id,
        dataRecord = this._createDataRecord('group', args && args.groupName),
        groupInfo = dataBuilder.generateGroup();
    dataApi.createGroup(
      { groupInfo: groupInfo, courseId: courseId},
      this._adminAuth,
      dataRecord.callback
    );
    return new createGroup.CreateGroup(this, dataRecord);
  }

  /**
   * Enrolls a previously created user in the context, or creates a new one if none exist already.
   * @param resultName Name to store the created course under in the data returned from .exec() (instructor or student)
   * @param enrollmentType Type of enrollment (P: instructor, S: student)
   * @param enrollFromExistingUser Boolean to determine if a new user should be created or an existing user be looked up.
   * @param overrides An optional object containing data that overrides the default fields generated for the user
   */
  private enrollUser(resultName: string, enrollmentType: KnownCourseRoleIdentifier, enrollFromExistingUser: boolean, overrides?: any, enrollmentOverrides?: any) {
    var userDataRecord = enrollFromExistingUser && this._lookup(resultName);

    //We aren't supposed to user an existing user, or none was found, so make a new one.
    if (!userDataRecord) {
      var userArgs: { resultName: string; overrides?: any; } = { resultName: resultName };
      if (overrides) {
        userArgs.overrides = overrides;
      }
      userDataRecord = this._root.user(userArgs)._dataRecord;
    }
    
    this.enrollment(this._resolveDataRecord(userDataRecord), enrollmentType, resultName, enrollmentOverrides);
    return new createUser.CreateUser(this, userDataRecord);
  }

  /**
   * Enrolls the given user into the last course created in the context as the specified role
   *
   * @param user The user to enroll
   * @param role The role to enroll the user as (Should be a single character value from course role model's KnownCourseRoleIdentifier)
   * @param resultName Name to store the created membership under.  "_membership" gets appended to name: &lt;resultName&gt;_membership
   */
  private enrollment(user: models.user.ILearnUser, role: KnownCourseRoleIdentifier, resultName: string, overrides?: any) {
    var course = this._getData();
    var membershipInfo = dataBuilder.generateMembership(user.id, course.id, role.toString(), overrides);
    var dataRecord = this._createDataRecord('membership', resultName + '_membership');
    dataApi.createMembership({ membership: membershipInfo, courseId: course.id }, this._adminAuth, dataRecord.callback);
    this._resolveDataRecord(dataRecord); //waiting for the creation of course membership to avoid timing issues
  }

  /**
   * Adds the course to a previously created term or creates a new term if none exist already
   *
   * @param args.term An optional key of a previously created term
   */
  term(args?: { term?: string; overrides?: any }) {
    var resultName = args && args.term || 'term';
    var termDataRecord = args && args.term && this._lookup(args.term);

    if (!termDataRecord) {
      var termArgs: { resultName: string; overrides?: any; } = { resultName: resultName };
      if (args && args.overrides) {
        termArgs.overrides = args.overrides;
      }
      termDataRecord = this._root.term(termArgs)._dataRecord;
    }

    var term: models.term.ILearnTerm = this._resolveDataRecord(termDataRecord);

    var course = this._getData();
    course.term = term;

    return new createGeneric.CreateGeneric(this, termDataRecord);
  }

  /** Creates a calendar item for the course calendar. */
  calendarItem(args?: {overrides?: any}) {
    var course = this._getData();

    var calendarInfo = args && args.overrides ? dataBuilder.generateCalendarItem(course.id, args.overrides)
      : dataBuilder.generateCalendarItem(course.id);

    var dataRecord = this._createDataRecord('calendarItem');
    dataApi.createCourseCalendarItem({ calendarItem: calendarInfo }, this._adminAuth, dataRecord.callback);

    return new createCalendar.CreateCalendarItem(this, dataRecord);
  }

  /** Creates a course schedule for the course calendar. */
  courseSchedule(args?: {overrides?: any}) {
    var course = this._getData();

    var calendarInfo = args && args.overrides ? dataBuilder.generateCourseSchedule(course.id, args.overrides)
      : dataBuilder.generateCourseSchedule(course.id);

    var dataRecord = this._createDataRecord('courseSchedule');
    dataApi.createCourseSchedule({ calendarItem: calendarInfo }, this._adminAuth, dataRecord.callback);

    return new createCalendar.CreateCalendarItem(this, dataRecord);
  }

  /**
   * Creates a test assessment in the course context.
   *
   * @param args.resultName An optional name to store the created user under in the data returned from .exec()
   * @param args.overrides Optional test overrides
   * @param args.dates Option start and end dates for visibility restriction of the test
   * @param args.addConversation Whether or not to create a conversation tied to the test
   * @param args.attemptCount Number of attempts allowed to be submitted. Used to create multiple attempts assessment.
   * @param args.visibility Optional setting of the test visibility. If args.dates is provided, the test will automatically
   * be set to Restricted and this setting will be ignored. By default the visibility is set to Visible.
   */
  test(args?: { resultName?: string; overrides?: any; dates?: { startDate: Date; endDate: Date }; addConversation?: boolean;
    attemptCount?: number; visibility?: enums.Visibility; groups?: any[] }) {

    if (args && args.attemptCount) {
      //need to set number of attempts in both places. Only setting multipleAttempts on gradeColumn will not work
      var multipleAttemptsOverrides = {
        possible: 100,
        test: {
          gradingColumn: {
            multipleAttempts: args.attemptCount,
            aggregationModel: 'LAST'
          },
          deploymentSettings: {
            attemptCount: args.attemptCount
          }
        }
      };

      if (args.overrides) {
        _.merge(args.overrides, multipleAttemptsOverrides);
      } else {
        args.overrides = multipleAttemptsOverrides;
      }
    }

    return this.assessment(enums.ContentHandler.TestLink, args);
  }

  /**
   * Creates an assessment in the course context.
   *
   * @param contentHandler: Required field which determines which type of assessment to create
   * @param args.resultName An optional name to store the created user under in the data returned from .exec()
   * @param args.overrides Optional test overrides
   * @param args.dates Option start and end dates for visibility restriction of the test
   * @param args.addConversation Whether or not to create a conversation tied to the test
   * @param args.visibility Optional setting of the test visibility. If args.dates is provided, the test will automatically
   * be set to Restricted and this setting will be ignored. By default the visibility is set to Visible.
   */
  assessment(contentHandler: enums.ContentHandler,
             args?: { resultName?: string; overrides?: any; dates?: { startDate: Date; endDate: Date }; addConversation?: boolean;
               visibility?: enums.Visibility; groups?: any[]}) {
    if (args == null) {
      args = {};
    }

    var course = this._getData();
    var parentId = this.getCourseRootFolder(course.id);
    var gradingSchemaId = this.getGradingSchemaId(course.id);
    var deployedAssessmentType = enums.DeployedAssessmentType.parseByContentHandler(contentHandler.toString());
    var assessmentTitle = dataBuilder.generateCourseContentTitle(contentHandler);

    var overrides: any = {};
    overrides[deployedAssessmentType.toString()] = {
      gradingColumn: {
        columnName: assessmentTitle,
        gradingSchemaId: gradingSchemaId
      },
      assessment: {
        title: assessmentTitle
      }
    };

    if (args.overrides) {
      overrides = _.merge(overrides, args.overrides);
    }

    var assessmentDetail = dataBuilder.generateAssessmentDetail(course.id, contentHandler, overrides);
    var assessment: any;
    if (args.dates) {
      assessment = dataBuilder.generateCourseContent(course.id,
        parentId,
        assessmentTitle,
        contentHandler,
        assessmentDetail,
        enums.Visibility.Restricted,
        args.dates
      );
    } else {
      var assessmentVisibility = (args && args.visibility) ? args.visibility : enums.Visibility.Visible;
      assessment = dataBuilder.generateCourseContent(course.id,
        parentId,
        assessmentTitle,
        contentHandler,
        assessmentDetail,
        assessmentVisibility
      );
    }

    // Will save to either 'assignment' or 'test' in create_base.ts depending on the assessment type.
    var dataRecord = this._createDataRecord(deployedAssessmentType.toString(), args.resultName);

    var payload: {
      assessment: any;
      contentHandler: enums.ContentHandler;
      courseId: string;
      addConversation?: boolean;
      assignedGroups?: any[]
    };

    payload = {
      assessment: assessment,
      contentHandler: contentHandler,
      courseId: course.id
    };
    if (args.addConversation) {
      payload.addConversation = true;
    }
    if (args.groups) {
      payload.assignedGroups = args.groups.map(group => ({groupId: group.id}));
    }

    dataApi.createAssessment(payload, this._adminAuth, dataRecord.callback);

    return new createAssessment.CreateAssessment(this, dataRecord);
  }

  rubric(args?: { resultName?: string; overrides?: any; }) {
    var course = this._getData();
    var dataRecord = this._createDataRecord('rubric', args && args.resultName);
    var rubric = dataBuilder.generateRubric(course.id, args && args.overrides);
    dataApi.createRubric({rubric: rubric, courseId: course.id}, this._adminAuth, dataRecord.callback);

    return new createRubric.CreateRubric(this, dataRecord);
  }

  /**
   * Creates an assignment in the course in context.
   *
   * @param args.resultName An optional name to store the created user under in the data returned from .exec()
   */
  assignment(args?: { resultName?: string;
    overrides?: any;
    dates?: { startDate: Date; endDate: Date };
    addConversation?: boolean; groups?: any[]}) {
    return this.assessment(enums.ContentHandler.UltraAssignment, args);
  }

  /**
   * Creates a targeted notification in the course in context.
   *
   * @param args.resultName An optional name to store the created targeted notification under in the data returned from .exec()
   */
  targetedNotification(args?: { resultName?: string; overrides?: any}) {
    // convert the roleName to the corresponding roleId
    if (args && args.overrides && args.overrides.insRoles && args.overrides.insRoles.length) {
      var flow = ab.getCurrentFlow();
      var institutionRoles: any = flow.sync(dataApi.getInstitutionRoles(this._adminAuth, flow.add())).results;

      args.overrides.insRoles.map((roleName: string, index: number) => {
        args.overrides.insRoles[index] = institutionRoles.filter((result: any) => result.roleName.toLowerCase() === roleName.toLowerCase())[0].roleId;
      });
    }

    var targetedNotificationInfo = <any>dataBuilder.generateTargetedNotification(args && args.overrides);

    var dataRecord = this._createDataRecord('targetedNotification');
    dataApi.createTargetedNotification({ targetedNotification: targetedNotificationInfo }, this._adminAuth, dataRecord.callback);

    return new createTargetedNotification.CreateTargetedNotification(this, dataRecord);
  }

  private getInstitutionRoleIdByName(roleName: string) {
    var flow = ab.getCurrentFlow();
    var result: any = flow.sync(dataApi.getInstitutionRoles(this._adminAuth, flow.add()));
    return result.results.filter((result: any) => result.roleName === roleName)[0].roleId;
  }

  /**
   * Creates a folder in the course in outline or discussion page.
   *
   * @param args.resultName An optional name to store the created folder under in the data returned from .exec()
   */
  folder(args?: { resultName?: string; overrides?: any; inOutline?: boolean; from?: string; courseId?: string; }) {
    var courseId = (args && args.courseId) ? args.courseId : this._getData().id;
    var parentId = (args && args.inOutline === false) ? this.getCourseInteractiveFolder(courseId) : this.getCourseRootFolder(courseId);
    var folderTitle = (args && args.overrides && args.overrides.title) ? args.overrides.title
      : dataBuilder.generateCourseContentTitle(enums.ContentHandler.Folder);
    var folderDetail = dataBuilder.generateFolderDetail();
    var folderVisibility = (args && args.overrides && args.overrides.visibility) ? args.overrides.visibility : enums.Visibility.Hidden;
    var adaptiveReleaseRules = args && args.overrides && args.overrides.adaptiveReleaseRules;
    var positionBefore = args && args.overrides && args.overrides.positionBefore;
    var positionAfter = args && args.overrides && args.overrides.positionAfter;

    var folder = dataBuilder.generateCourseContent(courseId,
      parentId,
      folderTitle,
      enums.ContentHandler.Folder,
      folderDetail,
      folderVisibility,
      adaptiveReleaseRules,
      positionBefore,
      positionAfter
    );
    var dataRecord = this._createDataRecord('folder', args && args.resultName);

    dataApi.createFolder({ folder: folder, courseId: courseId }, this._adminAuth, dataRecord.callback);

    return new createFolder.CreateFolder(this, dataRecord);
  }

  /**
   * Creates a document in the course in outline.
   *
   * @param args.resultName An optional name to store the created document under in the data returned from .exec()
   */
  document(args?: { resultName?: string; overrides?: any; inOutline?: boolean; parentId?: string; courseId?: string; }) {
    var courseId = (args && args.courseId) ? args.courseId : this._getData().id;
    var parentId;
    if (args && args.parentId) {
      parentId = args.parentId;
    } else {
      parentId = (args && args.inOutline === false) ? this.getCourseInteractiveFolder(courseId) : this.getCourseRootFolder(courseId);
    }
    var documentTitle = (args && args.overrides && args.overrides.title) ? args.overrides.title
      : dataBuilder.generateCourseContentTitle(enums.ContentHandler.Document);
    var documentDetail = dataBuilder.generateDocumentDetail();
    var documentVisibility = (args && args.overrides && args.overrides.visibility) ? args.overrides.visibility : enums.Visibility.Hidden;
    var adaptiveReleaseRules = args && args.overrides && args.overrides.adaptiveReleaseRules;
    var positionBefore = args && args.overrides && args.overrides.positionBefore;
    var positionAfter = args && args.overrides && args.overrides.positionAfter;
    var addConversation = (args && args.overrides && args.overrides.addConversation) ? args.overrides.addConversation : false;

    var document = dataBuilder.generateCourseContent(courseId,
      parentId,
      documentTitle,
      enums.ContentHandler.Folder,
      documentDetail,
      documentVisibility,
      adaptiveReleaseRules,
      positionBefore,
      positionAfter
    );
    var dataRecord = this._createDataRecord('document', args && args.resultName);

    dataApi.createDocument({ document: document, courseId: courseId, addConversation: addConversation },
      this._adminAuth, dataRecord.callback);

    return new createDocument.CreateDocument(this, dataRecord);
  }

  /**
   * Creates a file content item in the course outline
   */
  file(args: { filePath: string; resultName?: string; overrides?: any}) {
    var course = this._getData();
    var fileTitle = (args && args.overrides && args.overrides.title) || dataBuilder.generateCourseContentTitle(enums.ContentHandler.File);
    var fileVisibility = (args && args.overrides && args.overrides.visibility) ? args.overrides.visibility : enums.Visibility.Hidden;
    var adaptiveReleaseRules = args && args.overrides && args.overrides.adaptiveReleaseRules;
    var positionBefore = args && args.overrides && args.overrides.positionBefore;
    var positionAfter = args && args.overrides && args.overrides.positionAfter;

    var flow = ab.getCurrentFlow();
    var uploadedFile: models.file.ILearnFile = flow.sync(dataApi.uploadTempFile({filePath: args.filePath}, this._adminAuth, flow.add()));

    var file = dataBuilder.generateCourseContent(
      course.id,
      this.getCourseRootFolder(course.id),
      fileTitle,
      enums.ContentHandler.File,
      dataBuilder.generateFileContentDetail({uploadedFile: uploadedFile}),
      fileVisibility,
      adaptiveReleaseRules,
      positionBefore,
      positionAfter
    );

    var dataRecord = this._createDataRecord('file', args && args.resultName);

    dataApi.createCourseContent({
      content: file,
      courseId: course.id
    }, this._adminAuth, dataRecord.callback);

    return new createGeneric.CreateGeneric(this, dataRecord);
  }

  /**
   * Creates a discussion in the course in outline or discussion page.
   *
   * @param args.resultName An optional name to store the created discussion under in the data returned from .exec()
   */
  discussion(args: { from: string; resultName?: string; overrides?: any; inOutline?: boolean; groups?: any[]}) {
    var course = this._getData();
    var parentId = args.inOutline ? this.getCourseRootFolder(course.id) : this.getCourseInteractiveFolder(course.id);
    var discussionTitle = (args.overrides && args.overrides.title)
      || dataBuilder.generateCourseContentTitle(enums.ContentHandler.Discussion);
    var discussionContentDetail = dataBuilder.generateDiscussionContentDetail(discussionTitle);
    var discussionVisibility = (args.overrides && args.overrides.visibility) ? args.overrides.visibility : enums.Visibility.Hidden;

    var dataRecord = this._createDataRecord('discussion', args.resultName);
    var discussionContent: models.courseContent.ICourseContent = <any>dataBuilder.generateCourseContent(course.id,
      parentId,
      discussionTitle,
      enums.ContentHandler.Discussion,
      discussionContentDetail,
      discussionVisibility
    );

    var from = this._resolve(args.from);

    // Make sure membership data record is resolved
    if (this._lookup(args.from + '_membership')) {
      this._resolve(args.from + '_membership');
    }

    if (args.groups) {
      discussionContent.assignedGroups = args.groups.map(group => ({groupId: group.id}));
      discussionContent.isGroupContent = true;
    }

    dataApi.createDiscussion({ discussionContent: discussionContent, courseId: course.id, postFirst: args.overrides.postFirst }, from, dataRecord.callback);

    return new createDiscussion.CreateDiscussion(this, dataRecord);
  }

  courseLink(args?: { linkedContent?: models.courseContent.ILearnCourseContent; resultName?: string; overrides?: any; }) {
    var course = this._getData();
    var parentId = this.getCourseRootFolder(course.id);
    var title = (args && args.overrides && args.overrides.title) || dataBuilder.generateCourseContentTitle(enums.ContentHandler.CourseLink);
    var linkId = (args && args.linkedContent.id) || parentId;
    var contentDetail = dataBuilder.generateCourseLinkContentDetail(linkId);
    var visibility = (args && args.overrides && args.overrides.visibility) ? args.overrides.visibility : enums.Visibility.Hidden;

    var dataRecord = this._createDataRecord('courseLink', args && args.resultName);
    var courseLink = dataBuilder.generateCourseContent(course.id,
      parentId,
      title,
      enums.ContentHandler.CourseLink,
      contentDetail,
      visibility
    );

    dataApi.createCourseContent({
      content: courseLink,
      courseId: course.id
    }, this._adminAuth, dataRecord.callback);

    return new createGeneric.CreateGeneric(this, dataRecord);
  }

  private getCourseRootFolder(courseId: string) {
    var flow = ab.getCurrentFlow();
    var result = flow.sync(dataApi.getCourseContentRootFolder({ courseId: courseId }, this._adminAuth, flow.add()));
    return result.id;
  }

  private getCourseInteractiveFolder(courseId: string) {
    var flow = ab.getCurrentFlow();
    var result = flow.sync(dataApi.getCourseContentInteractiveFolder({ courseId: courseId }, this._adminAuth, flow.add()));
    return result.id;
  }

  private getGradingSchemaId(courseId: string) {
    var flow = ab.getCurrentFlow();
    var result: any = flow.sync(dataApi.getGradingSchemas({ courseId: courseId }, this._adminAuth, flow.add()));
    return result.results.filter((result: any) => result.title === 'Score.title')[0].id;
  }

  /**
   * Creates a link in the course in context. (visible by default)
   *
   * @param args.resultName An optional name to store the created link under
   */
  externalLink(args?: { resultName?: string; overrides?: any }) {
    var course = this._getData();
    var externalLinkTitle = (args && args.overrides && args.overrides.title)
      || dataBuilder.generateCourseContentTitle(enums.ContentHandler.ExternalLink);
    var linkVisibility = (args && args.overrides && args.overrides.visibility) ? args.overrides.visibility : enums.Visibility.Visible;
    var adaptiveReleaseRules = args && args.overrides && args.overrides.adaptiveReleaseRules;
    var positionBefore = args && args.overrides && args.overrides.positionBefore;
    var positionAfter = args && args.overrides && args.overrides.positionAfter;

    var link = dataBuilder.generateCourseContent(
      course.id,
      this.getCourseRootFolder(course.id),
      externalLinkTitle,
      enums.ContentHandler.ExternalLink,
      dataBuilder.generateExternalLinkDetail({url: args && args.overrides && args.overrides.url}),
      linkVisibility,
      adaptiveReleaseRules,
      positionBefore,
      positionAfter
    );

    var dataRecord = this._createDataRecord('externalLink', args && args.resultName);

    dataApi.createCourseContent({
      content: link,
      courseId: course.id
    }, this._adminAuth, dataRecord.callback);

    return new createContent.CreateContent(this, dataRecord);
  }

  /**
   * Creates a conversation in the course context.
   *
   * @param args.from The result name of the user starting the conversation ('instructor' or 'student', for example)
   * @param args.to The result names of the people invited to the conversation, excluding the user starting the conversation (['instructor']
   *                or ['student'], for example)
   * @param args.resultName An optional name to store the created message under in the data returned from .exec()
   */
  conversation(args: { from: string; to: string[]; resultName?: string; }) {
    var course = this._getData();
    var from = this._resolve(args.from);
    var resolve = this._resolve.bind(this);
    var to = args.to.map(resolve);

    // make sure the memberships have been created
    this._resolve(args.from + '_membership');
    args.to.map(to => to + '_membership').forEach(resolve);

    var dataRecord = this._createDataRecord('conversation', args && args.resultName);
    var conversation = dataBuilder.generateConversation(course.id, to.map((to: any) => to.id));
    dataApi.createConversation({ conversation: conversation }, from, dataRecord.callback);

    return new createConversation.CreateConversation(this, dataRecord);
  }

  /**
   * Created manual(offline) grade column
   * @param args Optional result name and optional object that if specified will be
   * merged into generated object (used for passing custom data)
   *
   * @returns {CreateGeneric} Generated object
   */
  offlineItem(args?: { resultName?: string; overrides?: any}) {
    var course = this._getData();
    var dataRecord = this._createDataRecord('offlineItem', args && args.resultName);
    var columnParams: any =  (args && args.overrides) ? args.overrides : {};
    columnParams.courseId = course.id;
    var column = dataBuilder.generateGradeColumn(columnParams);
    dataApi.createGradeItem({column: column}, this._adminAuth, dataRecord.callback);
    return new createOfflineItem.CreateOfflineItem(this, dataRecord);
  }

  overallGrade(args?: { resultName?: string; overrides?: any}) {
    var course = this._getData();
    var dataRecord = this._createDataRecord('overallGrade', args && args.resultName);
    var columnParams: any =  (args && args.overrides) ? args.overrides : {};
    if (columnParams.gradeItem) {
      columnParams.calculatedFormula = dataBuilder.generateMathMLFormulaBy1Item(columnParams);
    }
    columnParams.courseId = course.id;
    var column = dataBuilder.generateOverallGrade(columnParams);
    dataApi.createGradeItem({column: column}, this._adminAuth, dataRecord.callback);
    return new createOverallGrade.CreateOverallGrade(this, dataRecord);
  }

  contentExchangeImport(args: {packagePath: string; resultName?: string; overrides?: any}) {
    var courseId: string = this._getData().id;

    var dataRecord = this._createDataRecord('contentExchangeImport', args.resultName);

    var cxImportOptions = dataBuilder.generateContentExchangeImportOptions({overrides: args.overrides});

    dataApi.importCoursePackage(
      {
        courseId: courseId,
        packagePath: args.packagePath,
        cxImportOptions: cxImportOptions
      },
      this._adminAuth,
      dataRecord.callback
    );
    return new createGeneric.CreateGeneric(this, dataRecord);
  }

}

/**
 * Enum for the set of default Learn course roles identifier (duplicated from course-role-model for E2E testing)
 */
export class KnownCourseRoleIdentifier extends BaseEnum {
  static P = new KnownCourseRoleIdentifier('P'); // Instructor
  static T = new KnownCourseRoleIdentifier('T'); // Teaching Assistant
  static G = new KnownCourseRoleIdentifier('G'); // Grader
  static B = new KnownCourseRoleIdentifier('B'); // Course Builder
  static S = new KnownCourseRoleIdentifier('S'); // Student
  static U = new KnownCourseRoleIdentifier('U'); // Guest

  //Need to add a class member to give this class some structure to differentiate it from other enums
  private _known_course_role_identifier_enum: string;
}
