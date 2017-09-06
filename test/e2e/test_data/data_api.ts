/* tslint:disable:no-var-requires */
import _ = require('lodash');
import ab = require('asyncblock');
import request = require('request');
var config = require(__dirname + '/../../../../../config/config.js');
import dataBuilder = require('./data_builder');
import enums = require('./../controls/enums/index');
import models = require('../../../app/components/models');
import fs = require('fs');
import utilities = require('../../../app/components/models/utilities/utilities');

export interface IAuthInfo {
  userName: string;
  password: string;
}

interface IRequestOptions {
  body?: any;
  form?: any;
  formData?: any;
  method?: string;
  qs?: any;
  url: string;
}

interface IBatchRequestOptions {
  method: string;
  body?: any;
  relativeUrl: string;
}

export interface ILearnCourseConversation extends models.courseConversation.ILearnCourseConversation {
  messages: models.courseConversationMessage.ILearnCourseConversationMessage[];
}

export interface IGoalSet {
  docId?: string;
  docName: string;
  docType: string;
  docStatus: string;
  fType?: string;
  fStatus?: string;
}

export interface IGoalCategory {
  docId?: string;
  subDocId?: string;
  subDocName: string;
  subDocStatus: boolean;
}

export interface IGoal {
  parentSubDocId?: string;
  stdId?: string;
  title?: string;
  batchUid?: string;
  stdText: string;
  stdType: string;
  stdAlignmentStatus: string;
  layer: number;
  docEditable: boolean;
  addAnother: boolean;
  addChild: boolean;
}

var BASE_URL: string;
var API_PREFIX: string;
var IP_API_PREFIX: string;
var GOAL_URL: string;
var NONCE_AJAX = 'blackboard.platform.security.NonceUtil.nonce.ajax';
var JSESSIONID = 'JSESSIONID';

export function setBaseUrl(url: string) {
  BASE_URL = url;
  API_PREFIX = BASE_URL + config.server.apiBasePath;
  IP_API_PREFIX = BASE_URL + config.server.institutionApiBasePath;
  GOAL_URL = BASE_URL + '/webapps/goal/execute/';
}

interface IHeaderInfo {
  cookies: any;
  xsrf: string;
}
var _authStore: {[key: string]: IHeaderInfo} = Object.create(null);

export function getUserCookie(username: string, password: string, callback?: Function) {
  return ab((flow) => {
    var jar = request.jar();

    flow.sync(
      request({
        url: BASE_URL,
        method: 'GET',
        jar: jar,
        strictSSL: false,
      }, flow.add())
    );

    var response = flow.sync(
      request({
        url: BASE_URL + '/webapps/login/',
        method: 'POST',
        form: {
          user_id: username,
          action: 'login',
          encoded_pw: new Buffer(password).toString('base64'),
          password: password
        },
        jar: jar,
        strictSSL: false,
      }, flow.add())
    );

    if (response.statusCode >= 400) {
      throw new Error(response.statusCode + ': ' + (response.body && response.body.message || JSON.stringify(response.body)));
    }

    return jar;
  }, callback);
}

export function getXSRFToken(cookies: any, callback?: Function) {
  return ab((flow) => {
    var response = flow.sync(
      request({
        url: API_PREFIX + '/v1/utilities/xsrfToken',
        jar: cookies,
        json: true,
        strictSSL: false
      }, flow.add())
    );

    if (response.statusCode >= 400) {
      throw new Error(response.statusCode + ': ' + (response.body && response.body.message || JSON.stringify(response.body)));
    }

    return response.body.xsrfToken;
  }, callback);
}

function sendRequest(options: IRequestOptions, authInfo: IAuthInfo, callback?: Function,
                     handleOptions: (options: IRequestOptions, headerInfo: IHeaderInfo) => IRequestOptions = _.identity) {
  return ab((flow) => {
    var headerInfo = _authStore[authInfo.userName];
    if (!headerInfo) {
      let cookies = getUserCookie(authInfo.userName, authInfo.password).sync();
      let xsrf = getXSRFToken(cookies).sync();

      _authStore[authInfo.userName] = headerInfo = {cookies: cookies, xsrf: xsrf};
    }

    options.method = options.method || 'POST';
    var response = flow.sync(request(handleOptions(options, headerInfo), flow.add()));
    // refresh authentication info in case the session is timed out with 401 or return code 403
    if (response.statusCode === 401 || response.statusCode === 403) {
      delete _authStore[authInfo.userName];
      let cookies = getUserCookie(authInfo.userName, authInfo.password).sync();
      let xsrf = getXSRFToken(cookies).sync();
      _authStore[authInfo.userName] = headerInfo = {cookies: cookies, xsrf: xsrf};
      response = flow.sync(request(handleOptions(options, headerInfo), flow.add()));
    }
    if (response.statusCode >= 400) {
      throw new Error(response.statusCode + ': ' + (response.body && response.body.message || JSON.stringify(response.body)));
    }

    var data = response.body || {};
    var isBatchRequest = _.isArray(response.body);

    if (isBatchRequest) {
      // parse wrapper response body
      var results: any[] = [];
      response.body.forEach((request: any) => {
        results.push(request.body);
      });

      data = results;
    }

    if (_.isString(data)) {
      try {
        data = JSON.parse(data);
      } catch (e) {
        // parse error
        data = {text: data};
      }
    }
    data.url = options.url + (options.method === 'POST' ? '/' + data.id : '');
    return data;
  }, callback);
}

function makeApiCall(options: IRequestOptions, authInfo: IAuthInfo, callback?: Function) {
  return sendRequest(options, authInfo, callback, (options, headerInfo) => _.extend(options, {
    json: true,
    headers: {'X-Blackboard-XSRF': headerInfo.xsrf},
    jar: headerInfo.cookies,
    strictSSL: false
  }));
}

function makeLegacyCall(options: IRequestOptions, authInfo: IAuthInfo, callback?: Function) {
  return sendRequest(options, authInfo, callback, (options, headerInfo) => {
    _.extend(options, {
      jar: headerInfo.cookies,
      strictSSL: false
    });
    _.extend((options.form || options.qs || (options.qs = {})), {
      [NONCE_AJAX]: headerInfo.xsrf,
      v: _.find<any>(headerInfo.cookies.getCookies(BASE_URL), cookie => cookie.key === JSESSIONID).value
    });
    return options;
  });
}

export function createUser(options: { user: models.user.ILearnUser; }, authInfo: IAuthInfo, callback?: Function) {
  var user = options.user;

  return ab(() => {
    var createdUser = makeApiCall({
      url: API_PREFIX + '/v1/users',
      body: user
    }, authInfo).sync();

    createdUser.password = user.password; //The API doesn't return the password, set it here so it's available

    return createdUser;
  }, callback);
}

export function deleteUser(userId: string, callback?: Function) {
  return ab(() => {
    return makeApiCall({
      method: 'DELETE',
      url: `${API_PREFIX}/v1/users/${userId}`
    }, config.test.e2e.learnAdminAuth).sync();
  }, callback);
}

export function createCourse(options: { course: models.course.ILearnCourse; }, authInfo: IAuthInfo, callback?: Function) {
  var course = options.course;

  return ab(() => {
    return makeApiCall({
      url: API_PREFIX + '/v1/courses',
      body: course
    }, authInfo).sync();
  }, callback);
}

export function deleteCourse(courseId: string, callback?: Function) {
  return ab(() => {
    return makeApiCall({
      method: 'DELETE',
      url: `${API_PREFIX}/v1/courses/${courseId}`
    }, config.test.e2e.learnAdminAuth).sync();
  }, callback);
}

export function createCourseContent(
  options: { content: models.courseContent.ILearnCourseContent; courseId: string; },
  authInfo: IAuthInfo, callback?: Function
) {
  var content = options.content;
  var courseId = options.courseId;

  return ab(() => {
    return makeApiCall({
      url: API_PREFIX + '/v1/courses/' + courseId + '/contents',
      body: content
    }, authInfo).sync();
  }, callback);
}

export function getCourseContent(options: {contentId: string; courseId: string},
                                 authInfo: IAuthInfo, callback?: Function) {
  var contentId = options.contentId;
  var courseId = options.courseId;

  return ab(() => {
    return makeApiCall({
      method: 'GET',
      url: API_PREFIX + '/v1/courses/' + courseId + '/contents/' + contentId,
    }, authInfo).sync();
  }, callback);
}

export function createMembership(options: { membership: models.courseMembership.ILearnCourseMembership; courseId: string; },
                                 authInfo: IAuthInfo, callback?: Function) {
  var membership = options.membership;
  var courseId = options.courseId;

  return ab(() => {
    return makeApiCall({
      url: API_PREFIX + '/v1/courses/' + courseId + '/memberships',
      body: membership
    }, authInfo).sync();
  }, callback);
}

export function createGroup(options: {groupInfo: any; courseId: string},
                                 authInfo: IAuthInfo, callback?: Function) {
  var groupInfo = options.groupInfo,
      courseId = options.courseId;
  return ab(() => {
    return makeApiCall({
      url: API_PREFIX + '/v1/courses/' + courseId + '/groups',
      body: groupInfo
    }, authInfo).sync();
  }, callback);
}

export function updateGroup(options: {memberships: any; groupId: string; courseId: string},
                                 authInfo: IAuthInfo, callback?: Function) {
  var memberships = options.memberships,
      courseId = options.courseId;
  return ab(() => {
    return makeApiCall({
      method: 'PATCH',
      url: API_PREFIX + '/v1/courses/' + courseId + '/groups/' + options.groupId,
      body: {memberships: memberships}
    }, authInfo).sync();
  }, callback);
}

export function createOrganization(options: { organization: models.course.ILearnCourse; }, authInfo: IAuthInfo, callback?: Function) {
  var organization = options.organization;

  return ab(() => {
    return makeApiCall({
      url: API_PREFIX + '/v1/courses',
      body: organization
    }, authInfo).sync();
  }, callback);
}

export function createTerm(options: { term: models.term.ILearnTerm; }, authInfo: IAuthInfo, callback?: Function) {
  var term = options.term;

  return ab(() => {
    return makeApiCall({
      url: API_PREFIX + '/v1/terms',
      body: term
    }, authInfo).sync();
  }, callback);
}

export function createPreference(
  options: { preference: models.myPreference.ILearnMyPreference; },
  authInfo: IAuthInfo, callback?: Function
) {
  var preference = options.preference;

  return ab(() => {
    return makeApiCall({
      url: API_PREFIX + '/v1/users/me/preferences',
      body: preference
    }, authInfo).sync();
  }, callback);
}

export function setPreference(
  options: { preference: models.myPreference.ILearnMyPreference; },
  authInfo: IAuthInfo, callback?: Function
  ) {
  var preference = options.preference;

  return ab(() => {
    return makeApiCall({
      method: 'PUT',
      url: API_PREFIX + '/v1/users/me/preferences/' + preference.key,
      body: preference
    }, authInfo).sync();
  }, callback);
}

export function deletePreference(options: { preferenceKey: string; }, authInfo: IAuthInfo, callback?: Function) {
  var preferenceKey = options.preferenceKey;

  return ab(() => {
    return makeApiCall({
      method: 'DELETE',
      url: API_PREFIX + '/v1/users/me/preferences/' + preferenceKey
    }, authInfo).sync();
  }, callback);
}

export function disableLoginFTUE(forUser: IAuthInfo, callback?: Function) {
  return ab(() => {
    return setPreference({
      preference: {
        key: 'ultraui.first.time.welcome.welcome.visited',
        value: 'true'
      }
    }, forUser).sync();
  }, callback);
}

export function enableLoginFTUE(forUser: IAuthInfo, callback?: Function) {
  return ab(() => {
    return deletePreference({ preferenceKey: 'ultraui.first.time.welcome.welcome.visited' }, forUser).sync();
  }, callback);
}

export function getCourseContentRootFolder(options: { courseId: string; }, authInfo: IAuthInfo, callback?: Function) {
  var courseId = options.courseId;

  return ab(() => {
    return makeApiCall({
      method: 'GET',
      url: API_PREFIX + '/v1/courses/' + courseId + '/contents/ROOT'
    }, authInfo).sync();
  }, callback);
}

export function getCourseContentInteractiveFolder(options: { courseId: string; }, authInfo: IAuthInfo, callback?: Function) {
  var courseId = options.courseId;

  return ab(() => {
    return makeApiCall({
      method: 'GET',
      url: API_PREFIX + '/v1/courses/' + courseId + '/contents/INTERACTIVE'
    }, authInfo).sync();
  }, callback);
}

export function createCourseCalendarItem(
  options: { calendarItem: models.calendarItem.ILearnCalendarItem; },
  authInfo: IAuthInfo, callback?: Function
) {
  var calendarItem = options.calendarItem;

  return ab(() => {
    return makeApiCall({
      url: API_PREFIX + '/v1/courses/' + calendarItem.calendarId + '/calendars/calendarItems',
      body: calendarItem
    }, authInfo).sync();
  }, callback);
}

export function createPersonalOfficeHours(
  options: { userId: string; courseId: string; calendarItem: models.calendarItem.ILearnCalendarItem; },
  authInfo: IAuthInfo, callback?: Function
) {
  let userId = options.userId;
  let courseId = options.courseId;
  let calendarItem = options.calendarItem;

  return ab(() => {
    return makeApiCall({
      url: API_PREFIX + '/v1/courses/' + calendarItem.calendarId + '/users/' + userId + '/officeHours',
      body: calendarItem
    }, authInfo).sync();
  }, callback);
}

export function createCourseSchedule(
  options: { calendarItem: models.calendarItem.ILearnCalendarItem; },
  authInfo: IAuthInfo, callback?: Function
) {
  var calendarItem = options.calendarItem;

  return ab(() => {
    return makeApiCall({
      url: API_PREFIX + '/v1/courses/' + calendarItem.calendarId + '/schedule',
      body: calendarItem
    }, authInfo).sync();
  }, callback);
}

export function createPersonalCalendarItem(
  options: { userId: string; calendarItem: models.calendarItem.ILearnCalendarItem; },
  authInfo: IAuthInfo, callback?: Function
) {
  var userId = options.userId;
  var calendarItem = options.calendarItem;

  return ab(() => {
    return makeApiCall({
      url: API_PREFIX + '/v1/users/' + userId + '/calendarItems',
      body: calendarItem
    }, authInfo).sync();
  }, callback);
}

export function createTargetedNotification(
  options: { targetedNotification: models.targetedNotification.ITargetedNotification; },
  authInfo: IAuthInfo, callback?: Function
) {
  var targetedNotification = options.targetedNotification;

  return ab(() => {
    return makeApiCall({
      url: API_PREFIX + '/v1/announcements',
      body: targetedNotification
    }, authInfo).sync();
  }, callback);
}

export function getInstitutionRoles(authInfo: IAuthInfo, callback?: Function) {
  return ab(() => {
    return makeApiCall({
      method: 'GET',
      url: API_PREFIX + '/v1/roles/institutionRoles'
    }, authInfo).sync();
  }, callback);
}

export function createConversation(options: { conversation: ILearnCourseConversation; }, authInfo: IAuthInfo, callback?: Function) {
  var conversation = options.conversation;

  return ab(() => {
    return makeApiCall({
      url: API_PREFIX + '/v1/courses/' + conversation.courseId + '/conversations',
      body: conversation
    }, authInfo).sync();
  }, callback);
}

export function createReply(
  options: { reply: models.courseConversationMessage.ILearnCourseConversationMessage; courseId: string; },
  authInfo: IAuthInfo, callback?: Function
) {
  var reply = options.reply;
  var courseId = options.courseId;

  return ab(() => {
    return makeApiCall({
      url: API_PREFIX + '/v1/courses/' + courseId + '/conversations/' + reply.conversationId + '/messages',
      body: reply
    }, authInfo).sync();
  }, callback);
}

export function getGradingSchemas(options: { courseId: string; }, authInfo: IAuthInfo, callback?: Function) {
  var courseId = options.courseId;

  return ab(() => {
    return makeApiCall({
      method: 'GET',
      url: API_PREFIX + '/v1/courses/' + courseId + '/gradebook/schemas'
    }, authInfo).sync();
  }, callback);
}

export function createQuestion(
  options: { question: models.question.IQuestion; courseId: string; assessmentId: string; },
  authInfo: IAuthInfo, callback?: Function
) {
  var question = options.question;
  var courseId = options.courseId;
  var assessmentId = options.assessmentId;

  return ab(() => {
    return makeApiCall({
      url: API_PREFIX + '/v1/courses/' + courseId + '/assessments/' + assessmentId + '/questions',
      body: question
    }, authInfo).sync();
  }, callback);
}

export function createQuestions(options: { questionsToCreate: models.question.IQuestion[]; courseId: string; assessmentId: string; },
                                authInfo: IAuthInfo, callback?: Function) {
  return ab(() => {
    var batchBody: IBatchRequestOptions[] = [];
    for (let i = 0; i < options.questionsToCreate.length; i++) {
      batchBody.push({
        method: 'POST',
        body: options.questionsToCreate[i],
        relativeUrl: 'v1/courses/' + options.courseId + '/assessments/' + options.assessmentId + '/questions'
      });
    }

    return makeApiCall({
      method: 'PUT',
      url: API_PREFIX + '/v1/utilities/batch',
      body: batchBody
    }, authInfo).sync();
  }, callback);
}

export function addConversation(
  options: { courseId: string; contentId: string; },
  authInfo: IAuthInfo, callback?: Function
) {
  var courseId = options.courseId;
  var contentId = options.contentId;

  return ab(() => {
    var content = makeApiCall({
      method: 'PATCH',
      url: API_PREFIX + '/v1/courses/' + courseId + '/contents/' + contentId,
      body: { isAvailable: true, forumAttacherAction: 'ADD' }
    }, authInfo).sync();

    var courseLinkId = content.attachedForumLink['resource/x-bb-courselink'].courseContent;

    var forumLink = makeApiCall({
      method: 'GET',
      url: API_PREFIX + '/v1/courses/' + courseId + '/contents/' + courseLinkId
    }, authInfo).sync();

    var forum = forumLink.contentDetail['resource/x-bb-forumlink'];

    var discussion = dataBuilder.generateCourseConversation(courseId, forum.id, null, authInfo.userName);
    forum.message = createForumMessage({ forumMessage: discussion, courseId: courseId, forumId: forum.id }, authInfo).sync();

    return forum;
  }, callback);
}

export function addGroupContent(
  options: { courseId: string; contentId: string; assignedGroups: any[] },
  authInfo: IAuthInfo, callback?: Function
) {
  var courseId = options.courseId;
  var contentId = options.contentId;
  var assignedGroups = options.assignedGroups;
  return ab(() => {
    return makeApiCall({
      method: 'PATCH',
      url: API_PREFIX + '/v1/courses/' + courseId + '/contents/' + contentId + '?expand=assignedGroups',
      body: { isGroupContent: true, assignedGroups: assignedGroups }
    }, authInfo).sync();
  }, callback);
}

export function getDeployedAssessment(content: models.courseContent.ILearnCourseContent): models.assessmentDetail.IDeployedAssessment {
  var contentDetail = content.contentDetail[content.contentHandler.toString()];
  var deployedAssessmentType = enums.DeployedAssessmentType.parseByContentHandler(content.contentHandler.toString());
  return contentDetail[deployedAssessmentType.toString()];
}

export function createAssessment(
  options: { assessment: models.courseContent.ILearnCourseContent; courseId: string; addConversation?: boolean; assignedGroups?: any[]},
  authInfo: IAuthInfo, callback?: Function
) {
  var assessment = options.assessment;
  var courseId = options.courseId;

  return ab(() => {
    var result = createCourseContent({ content: assessment, courseId: courseId }, authInfo).sync();
    var deployedAssessment = getDeployedAssessment(result);
    //TODO: Assignments requires a question to be created for E2E tests to work. Once they are refactored this can be removed.
    //All other assessment types should build questions separately.
    if (enums.DeployedAssessmentType.Assignment.isEqualTo(deployedAssessment.deployedAssessmentType)) {
      var assessmentId = deployedAssessment.assessment.id;
      var question = dataBuilder.generateQuestionForAssessment(assessment.title, enums.QuestionType.Essay);
      createQuestion({ question: question, courseId: courseId, assessmentId: assessmentId }, authInfo).sync();
    }

    if (options.addConversation) {
      addConversation({ courseId: courseId, contentId: result.id }, authInfo).sync();
    }
    if (options.assignedGroups) {
      // update the content of the assignment, specifically the assignedGroups property.
      result = addGroupContent({ courseId: courseId, contentId: result.id, assignedGroups: options.assignedGroups}, authInfo).sync();
    }
    return result;
  }, callback);
}

export function createFolder(
  options: { folder: models.courseContent.ILearnCourseContent; courseId: string; },
  authInfo: IAuthInfo, callback?: Function
) {
  var folder = options.folder;
  var courseId = options.courseId;

  return ab(() => {
    var result = createCourseContent({ content: folder, courseId: courseId }, authInfo).sync();

    return result;
  }, callback);
}

export function createDocument(
  options: { document: models.courseContent.ILearnCourseContent; courseId: string; addConversation: boolean },
  authInfo: IAuthInfo, callback?: Function
) {
  var document = options.document;
  var courseId = options.courseId;

  return ab(() => {
    var result = createCourseContent({ content: document, courseId: courseId }, authInfo).sync();
    if (options.addConversation) {
      addConversation({ courseId: courseId, contentId: result.id }, authInfo).sync();
    }
    return result;
  }, callback);
}

export function startAttempt(
  options: { gradingColumnId: string; courseId: string; contentHandler: string; groupId?: string},
  authInfo: IAuthInfo,
  callback?: Function
) {
  var gradingColumnId = options.gradingColumnId;
  var courseId = options.courseId;
  var groupId = options.groupId;
  var url = API_PREFIX + '/v1/courses/' + courseId + '/gradebook/columns/' + gradingColumnId
      + (groupId ? '/groupAttempts?expand=toolAttemptDetail,attempts,attempts.toolAttemptDetail' : '/attempts?expand=toolAttemptDetail');
  return ab(() => {
    return makeApiCall({
      url: url,
      body: dataBuilder.generateAttempt(options.contentHandler, groupId)
    }, authInfo).sync();
  }, callback);
}

export function updateQuestionAttempt(
  options: {
    questionAttempt: models.questionAttempt.IQuestionAttempt;
    attempt: any;
    courseId: string;
    groupId?: string;
  },
  authInfo: IAuthInfo, callback?: Function
) {
  var questionAttempt = options.questionAttempt;
  var attempt = options.attempt;
  var courseId = options.courseId;
  var url = API_PREFIX + '/v1/courses/' + courseId + '/gradebook/attempts/'
      + (options.groupId ? attempt.attempts[0].id : attempt.id)
      + '/assessment/answers/' + questionAttempt.id;
  return ab(() => {
    return makeApiCall({
      url: url,
      method: 'PATCH',
      body: questionAttempt
    }, authInfo).sync();
  }, callback);
}

export function updateAttempt(
  options: {
    courseId: string;
    attempt: models.gradeAttempt.IGradeAttempt;
  },
  authInfo: IAuthInfo, callback?: Function
) {
  var attemptId = options.attempt.id;
  var courseId = options.courseId;
  return ab(() => {
    return makeApiCall({
      url: API_PREFIX + '/v1/courses/' + courseId + '/gradebook/attempts/' + attemptId,
      method: 'PATCH',
      body: options.attempt
    }, authInfo).sync();
  }, callback);
}

export function submitAttempt(options: { attempt: any; contentHandler: string; courseId: string; groupId?: string;  }, authInfo: IAuthInfo, callback?: Function) {
  var attempt = options.attempt;
  var toolAttemptDetail: models.gradeAttempt.IToolAttemptDetail = {};
  toolAttemptDetail[enums.ScoreProviderHandle.parseByContentHandler(options.contentHandler).toString()] = {
    type: enums.AssessmentType.parseByContentHandler(options.contentHandler)
  };
  var courseId = options.courseId;
  var url = API_PREFIX + '/v1/courses/' + courseId + '/gradebook'
      + (options.groupId ? '/groupAttempts/' : '/attempts/') + attempt.id
      + '?expand=toolAttemptDetail';
  return ab(() => {
    return makeApiCall({
      url: url,
      method: 'PATCH',
      body: {
        status: 'NEEDS_GRADING',
        toolAttemptDetail: toolAttemptDetail //MUST include toolAttemptDetail to kick-off grading of auto-graded questions. See assessment-attempt-controller L.287.
      }
    }, authInfo).sync();
  }, callback);
}

export function createAttempts(count: number, options: { assessment: models.courseContent.ILearnCourseContent;
                                            assignmentSubmission?:  models.questionAttempt.IEssayQuestionAttempt;
                                            courseId: string;
                                            doNotSubmit?: boolean;
                                            groupId?: string; },
                                  authInfo: IAuthInfo, callback: Function) {
  return ab(() => {

    var attempts: models.gradeAttempt.IGradeAttempt[] = [];
    var courseId = options.courseId;
    var content = options.assessment;
    var gradingColumnId = getDeployedAssessment(content).gradingColumn.id;
    var contentHandler = content.contentHandler.toString();

    for (let i = 0; i < count; i++) {
      //create attempt
      var attempt = startAttempt({
        gradingColumnId: gradingColumnId,
        courseId: courseId,
        contentHandler: contentHandler,
        groupId: options.groupId
      }, authInfo).sync();

      //submit
      submitAttempt({attempt: attempt, contentHandler: contentHandler, courseId: courseId, groupId: options.groupId}, authInfo).sync();

      attempts.push(attempt);
    }

    return attempts;
  }, callback);
}

export function createAttempt(options: { assessment: models.courseContent.ILearnCourseContent;
                                         courseId: string;
                                         groupId?: string;
                                         doNotSubmit?: boolean;
                                         responseBbml?: { rawText: string; fileLocation: string; } },
                                 authInfo: IAuthInfo, callback: Function) {
  var content = options.assessment;
  var courseId = options.courseId;
  return ab(() => {
    // E_TOO_MANY_ENUMS!!!
    var contentHandler = content.contentHandler.toString();
    var assessment = getDeployedAssessment(content);
    var gradingColumnId = assessment.gradingColumn.id;
    var attempt = startAttempt({
        gradingColumnId: gradingColumnId,
        courseId: courseId,
        contentHandler: contentHandler,
        groupId: options.groupId
      },
      authInfo).sync();

    return options.doNotSubmit ? attempt : submitAttempt({attempt: attempt, contentHandler: contentHandler, courseId: courseId, groupId: options.groupId}, authInfo).sync();
  }, callback);
}

export function gradeItem(
  options: {
    grade: models.gradeAttempt.ISourceGradeAttempt;
    gradingColumnId: string;
    gradeId: string;
    attemptId: string;
    courseId: string;
    group?: any;
  },
  authInfo: IAuthInfo, callback?: Function
) {
  var grade = options.grade;
  var gradingColumnId = options.gradingColumnId;
  var gradeId = options.gradeId;
  var attemptId = options.attemptId;
  var courseId = options.courseId;
  var group = options.group;

  return ab(() => {
    return makeApiCall({
      url: API_PREFIX + '/v1/courses/' + courseId + (group ? '/gradebook/groupAttempts/' + attemptId + '?applyToAll=true&expand=attempts' :
      '/gradebook/columns/' + gradingColumnId + '/grades/' + gradeId + '/attempts/' + attemptId),
      method: 'PATCH',
      body: grade
    }, authInfo).sync();
  }, callback);
}

export function overrideGrade(
  options: {
    grade: models.gradeAttempt.ISourceGradeAttempt;
    gradingColumnId: string;
    gradeId: string;
    attemptId: string;
    courseId: string;
    group?: any;
  },
  authInfo: IAuthInfo, callback?: Function
) {
  var grade = options.grade;
  var gradingColumnId = options.gradingColumnId;
  var gradeId = options.gradeId;
  var courseId = options.courseId;

  return ab(() => {
    return makeApiCall({
      url: API_PREFIX + '/v1/courses/' + courseId + '/gradebook/columns/' + gradingColumnId + '/grades/' + gradeId,
      method: 'PATCH',
      body: grade
    }, authInfo).sync();
  }, callback);
}

export function postGrade(
  options: { gradingColumnId: string; gradeId: string; courseId: string; group?: any},
  authInfo: IAuthInfo, callback?: Function
) {
  var gradingColumnId = options.gradingColumnId;
  var gradeId = options.gradeId;
  var courseId = options.courseId;
  var group = options.group;

  return ab(() => {
    return makeApiCall({
      url: API_PREFIX + '/v1/courses/' + courseId + '/gradebook/columns/' + gradingColumnId +
      (group ? '/groupAssociations/' + group.groupAssociationId + '/postReadyGroupAttempts' :
      '/grades/' + gradeId + '/postReadyGrades'),
      body: {}
    }, authInfo).sync();
  }, callback);
}

export function createGrade(
  options: {
    grade: models.gradeAttempt.ISourceGradeAttempt;
    submission: models.gradeAttempt.ISourceGradeAttempt;
    assessment: models.courseContent.ILearnCourseContent;
    courseId: string;
    postGrade?: boolean;
    group?: any;
    override?: boolean;
  },
  authInfo: IAuthInfo, callback: Function
) {
  var grade = options.grade;
  var submission = options.submission;
  var assessment = options.assessment;
  var courseId = options.courseId;

  return ab(() => {
    var gradingColumnId = getDeployedAssessment(assessment).gradingColumn.id;
    var gradeId = submission.gradeId;
    var attemptId = submission.id;
    var args = {
      grade: grade,
      gradingColumnId: gradingColumnId,
      gradeId: gradeId,
      attemptId: attemptId,
      courseId: courseId,
      group: options.group
    };
    var result: any;
    if (options.override) {
      result = overrideGrade(args, authInfo).sync();
    } else {
      result = gradeItem(args, authInfo).sync();
    }
    if (options.postGrade) {
      postGrade({ gradingColumnId: gradingColumnId, gradeId: gradeId, courseId: courseId, group: options.group }, authInfo).sync();
    }

    return result;
  }, callback);
}

/**
 * Adds feedback to the grade record
 */
export function addFeedbackToGrade(
  options: {
    instructorFeedback: utilities.ILearnMarkup,
    courseId: string,
    columnId: string,
    gradeId: string
  },
  authInfo: IAuthInfo,
  callback?: Function
) {

  return ab(() => {
    return makeApiCall({
      url: API_PREFIX + '/v1/courses/' + options.courseId + '/gradebook/columns/' + options.columnId + '/grades/' + options.gradeId,
      method: 'PATCH',
      body: {instructorFeedback: options.instructorFeedback}
    }, authInfo, callback).sync();
  });
}

/**
 * Adds feedback to the attempt record
 */
export function addFeedbackToAttempt(
  options: {
    instructorFeedback: utilities.ILearnMarkup,
    courseId: string,
    columnId: string,
    gradeId: string,
    attemptId: string,
    toolAttemptDetail: models.gradeAttempt.IToolAttemptDetail
  },
    authInfo: IAuthInfo,
    callback?: Function
  ) {

  return ab(() => {
    let url = API_PREFIX +
      `/v1/courses/${options.courseId}/gradebook/columns/${options.columnId}` +
      `/grades/${options.gradeId}/attempts/${options.attemptId}?expand=toolAttemptDetail`;
    return makeApiCall({
      url: url,
      method: 'PATCH',
      body: {
        feedbackToUser: options.instructorFeedback,
        toolAttemptDetail: options.toolAttemptDetail
      }
    }, authInfo, callback).sync();
  });
}

export function createGradeItem(
  options: {column: models.gradeColumn.ISourceGradeColumn},
  authInfo: IAuthInfo,
  callback?: Function
) {
  var column = options.column;
  var courseId = options.column.courseId;

  return ab(() => {
    return makeApiCall({
      url: API_PREFIX + '/v1/courses/'
      + courseId + '/gradebook/columns',
      method: 'POST',
      body: column
    }, authInfo).sync();
  }, callback);
}

export function createForumMessage(
  options: { forumMessage: models.courseMessage.ICourseMessage; courseId: string; forumId: string; postFirst?: boolean},
  authInfo: IAuthInfo, callback?: Function
  ) {
  var forumMessage = options.forumMessage;
  var courseId = options.courseId;
  var forumId = options.forumId;

  return ab(() => {
    return makeApiCall({
      url: API_PREFIX + '/v1/courses/' + courseId + '/discussionboards/default/forums/' + forumId + '/messages',
      body: forumMessage
    }, authInfo).sync();
  }, callback);
}

export function createRubric(
  options: { rubric: models.rubric.ILearnRubric, courseId: string },
  authInfo: IAuthInfo,
  callback?: Function
) {
  var rubric = options.rubric;
  var courseId = options.courseId;

  return ab(() => {
    return makeApiCall({
      url: API_PREFIX + '/v1/courses/' + courseId + '/rubrics',
      body: rubric
    }, authInfo).sync();
  }, callback);
}

export function createRubricAssociation(
  options: { rubric: models.rubric.ILearnRubric, courseId: string, columnId: string },
  authInfo: IAuthInfo,
  callback?: Function
) {

  return ab(() => {
    return makeApiCall({
      url: API_PREFIX + '/v1/courses/' + options.courseId + '/gradebook/columns/' + options.columnId + '?expand=associatedRubrics',
      body: {rubricAssociations: [{rubricId: options.rubric.id + ''}]},
      method: 'PATCH'
    }, authInfo).sync();
  }, callback);
}

export function createDiscussion(
  options: { discussionContent: models.courseContent.ILearnCourseContent; courseId: string; postFirst?: boolean; },
  authInfo: IAuthInfo, callback?: Function
  ) {
  var discussionContent = options.discussionContent;
  var courseId = options.courseId;

  return ab(() => {
    var result: models.courseContent.ILearnCourseContent =
      createCourseContent({ content: discussionContent, courseId: courseId }, authInfo).sync();
    var forum = result.contentDetail['resource/x-bb-forumlink'];
    var discussion = dataBuilder.generateDiscussion(courseId, forum.id, null, authInfo.userName, result.title, null, options.postFirst);
    forum.message = createForumMessage({ forumMessage: discussion, courseId: courseId, forumId: forum.id }, authInfo).sync();
    return result;
  }, callback);
}

export function editMessage(options: { courseId : string; forumMessage: models.courseMessage.ICourseMessage;  },
                            authInfo: IAuthInfo, callback?: Function) {
  var forumMessage = options.forumMessage;
  var courseId = options.courseId;
  return ab(() => {
    return makeApiCall({
      url: API_PREFIX + '/v1/courses/' + courseId + '/discussionboards/default/forums/' + forumMessage.forumId + '/messages/' +
      forumMessage.id,
      body: forumMessage,
      method: 'PATCH',
    }, authInfo).sync();
  }, callback);

}

export function enableForumOnContent(options: {contentId: string; courseId: string},
                                     authInfo: IAuthInfo, callback?: Function) {
  var courseId = options.courseId;
  var contentId = options.contentId;
  return ab(() => {
    var contentWithForum = attachForum({contentId: contentId, courseId: courseId}, authInfo).sync();
    var hardLinkContent = getCourseContent(
      {
        contentId: contentWithForum.attachedForumLink['resource/x-bb-courselink'].courseContent,
        courseId: courseId
      },
      authInfo).sync();
    var forum = hardLinkContent.contentDetail['resource/x-bb-forumlink'];
    var discussion = dataBuilder.generateDiscussion(courseId, forum.id, null, authInfo.userName, hardLinkContent.title);
    forum.message = createForumMessage({forumMessage: discussion, courseId: courseId, forumId: forum.id}, authInfo).sync();
    return hardLinkContent;
  }, callback);
}

export function attachForum(options: {contentId: string; courseId: string},
                            authInfo: IAuthInfo, callback?: Function) {
  var courseId = options.courseId;
  var contentId = options.contentId;
  return ab(() => {
    return makeApiCall({
      method: 'PATCH',
      url: API_PREFIX + '/v1/courses/' + courseId + '/contents/' + contentId,
      body: {forumAttacherAction: 'ADD'}
    }, authInfo).sync();
  }, callback);
}

export function createForumReply(options: {
  forumReply: models.courseMessage.ICourseMessage; courseId: string; forumId: string; messageId: string; groupId?: string; },
                                 authInfo: IAuthInfo, callback?: Function) {
  var forumReply = options.forumReply;
  var courseId = options.courseId;
  var forumId = options.forumId;
  var messageId = options.messageId;
  var groupIdParamString = options.groupId && options.groupId.length > 0 ? '?groupId=' + options.groupId : '';

  return ab(() => {
    return makeApiCall({
      url: API_PREFIX + '/v1/courses/' + courseId + '/discussionboards/default/forums/' + forumId + '/messages/' + messageId + '/replies' + groupIdParamString,
      body: forumReply
    }, authInfo).sync();
  }, callback);
}

// Time limit
export function enableTimeLimitOnContent(options: {contentId: string; courseId: string, assessment: any},
   authInfo: IAuthInfo, callback?: Function) {

  var courseId = options.courseId;
  var contentId = options.contentId;
  return ab(() => {
    return makeApiCall({
      url: API_PREFIX + '/v1/courses/'
      + courseId + '/contents/' + contentId,
      method: 'PATCH',
      body: options.assessment
    }, authInfo).sync();
  }, callback);
}

export function getSystemInfo(authInfo: IAuthInfo, callback?: Function) {
  return ab(() => {
    return makeApiCall({
      method: 'GET',
      url: API_PREFIX + '/v1/utilities/systemInfo'
    }, authInfo).sync();
  }, callback);
}

export function getCustomPage(authInfo: IAuthInfo, type: string, callback?: Function) {
  return ab(() => {
    return makeApiCall({
      method: 'GET',
      url: IP_API_PREFIX + '/custom-page?type=' + type
    }, authInfo).sync();
  }, callback);
}

export function getCustomPageModules(authInfo: IAuthInfo, id: string, callback?: Function) {
  return ab(() => {
    return makeApiCall({
      method: 'GET',
      url: IP_API_PREFIX + '/custom-page/' + id + '/modules',
    }, authInfo).sync();
  }, callback);
}

export function getCustomPageModuleResources(authInfo: IAuthInfo, moduleId: string, callback?: Function) {
  return ab(() => {
    return makeApiCall({
      method: 'GET',
      url: IP_API_PREFIX + '/module/' + moduleId + '/resources',
    }, authInfo).sync();
  }, callback);
}

export function gradeGradeItem(
  options: {
    courseId: string;
    columnId: string;
    userId: string;
    postGrade: boolean;
    grade: models.gradeDetail.IGradeDetail
  },
  authInfo: IAuthInfo,
  callback?: Function) {

  return ab(() => {
    var result = makeApiCall({
      url: API_PREFIX + '/v1/courses/'
      + options.courseId + '/gradebook/columns/'
      + options.columnId + '/grades?userId=' + options.userId,
      method: 'POST',
      body: options.grade
    }, authInfo).sync();

    if (options.postGrade) {
      postGrade({ gradingColumnId: options.columnId, gradeId: result.id, courseId: options.courseId }, authInfo).sync();
    }

    return result;
  }, callback);
}

export function uploadTempFile(
  options: {filePath: string},
  authInfo: IAuthInfo,
  callback?: Function) {

  return ab(() => {
    return makeApiCall({
      url: API_PREFIX + '/v1/files?expand=mimeType,isMedia',
      method: 'POST',
      formData: {file: fs.createReadStream(options.filePath)}
    }, authInfo).sync();
  }, callback);
}

export function getSystemTask(options: { taskId: string }, authInfo: IAuthInfo, callback?: Function) {
  return ab(() => {
    return makeApiCall({
      method: 'GET',
      url: API_PREFIX + '/v1/scheduledTasks/' + options.taskId
    }, authInfo).sync();
  }, callback);
}

export function runSystemTaskNow(options: { taskId: string }, authInfo: IAuthInfo, callback?: Function) {
  return ab(() => {
    return makeApiCall({
      url: API_PREFIX + '/v1/scheduledTasks/' + options.taskId + '/run'
    }, authInfo).sync();
  }, callback);
}

export function importCoursePackage(
  options: {courseId: string; packagePath: string; cxImportOptions: any},
  authInfo: IAuthInfo,
  callback?: Function) {

  return ab((flow) => {
    //upload the package
    var uploadedFile: models.file.ILearnFile = uploadTempFile({ filePath: options.packagePath}, authInfo).sync();

    //schedule the import task
    var importTask = makeApiCall({
      url: API_PREFIX + '/v1/courses/'
      + options.courseId + '/imports'
      + '?fileName=' + uploadedFile.fileName
      + '&fileLocation=' + uploadedFile.fileLocation,
      method: 'POST',
      body: options.cxImportOptions
    }, authInfo).sync();

    //start the task now, so we aren't waiting for it to start
    if (importTask.taskStatus === 'WAITING') {
      importTask = runSystemTaskNow({taskId: importTask.taskId}, authInfo).sync();
    }
    //poll and wait for it to complete
    var wait = 2000; //poll wait time
    var loopIter = 0;
    var maxLoop = 60 * 1000 / wait; //60 seconds of polling

    while ((importTask.taskStatus === 'RUNNING' || importTask.taskStatus === 'WAITING') && loopIter < maxLoop) {
      loopIter++;
      setTimeout(flow.add(), wait);
      flow.wait();
      importTask = getSystemTask({taskId: importTask.taskId}, authInfo).sync();
    }

    if (importTask.taskStatus !== 'COMPLETE') {
      throw new Error(
          'An initial clean import is required for test data from the sample package. Importing a content exchange package responded as '
           + importTask.taskStatus
      );
    }

    return importTask;
  }, callback);
}

export function getGrade(courseId: string, columnId: string, userId: string, authInfo: IAuthInfo, callback?: Function) {
  return ab((flow) => {
    var gradeUrl =  API_PREFIX + '/v1/courses/' + courseId + '/gradebook/columns/' + columnId + '/users/' + userId;
    return makeApiCall({url: gradeUrl, method: 'GET'}, authInfo).sync();
  }, callback);
}

export function gradeGradedDiscussion(courseId: string, forumMessage: models.courseMessage.ICourseMessage, userId: string,
                                      grade: models.gradeAttempt.ISourceGradeAttempt, authInfo: IAuthInfo, callback?: Function) {
  return ab((flow) => {
    var gradeUrl = API_PREFIX + '/v1/courses/' + courseId + '/gradebook/columns/' + forumMessage.gradedColumn.id + '/grades?userId=' + userId;
    setTimeout(flow.add(), 5000);
    flow.wait();
    var gradeDetail = makeApiCall({url: gradeUrl, method: 'GET'}, authInfo).sync();
    var attemptId = gradeDetail.results[0].lastAttemptId;
    var gradeId = gradeDetail.results[0].id;

    return patchAttempt(courseId, forumMessage.gradedColumn.id, gradeId, attemptId, grade, authInfo, callback).sync();
  }, callback);
}

export function postGradedDiscussion(courseId: string, forumMessage: models.courseMessage.ICourseMessage, userId: string,
                                     grade: models.gradeAttempt.ISourceGradeAttempt, authInfo: IAuthInfo, callback?: Function) {
  return ab((flow) => {
    var gradeUrl = API_PREFIX + '/v1/courses/' + courseId + '/gradebook/columns/' + forumMessage.gradedColumn.id + '/grades?userId=' + userId;
    setTimeout(flow.add(), 5000);
    flow.wait();
    var gradeDetail = makeApiCall({url: gradeUrl, method: 'GET'}, authInfo).sync();
    setTimeout(flow.add(), 5000);
    flow.wait();
    return postGrade({
        gradingColumnId: forumMessage.gradedColumn.id,
        gradeId: gradeDetail.results[0].id,
        courseId: courseId
      },
      authInfo,
      callback).sync();
  }, callback);
}

export function patchAttempt(courseId: string, columnId: string, gradeId: string, attemptId: string,
                             grade: models.gradeAttempt.ISourceGradeAttempt, authInfo: IAuthInfo, callback?: Function) {
  return ab((flow) => {
    return makeApiCall({
      url: API_PREFIX + '/v1/courses/' + courseId + '/gradebook/attempts/' + attemptId,
      method: 'PATCH',
      body: grade
    }, authInfo, callback).sync();
  });
}

export function patchFeedbackForGradedDiscussion(courseId: string, forumMessage: models.courseMessage.ICourseMessage, userId: string,
                                      authInfo: IAuthInfo, feedbackText: string, callback?: Function) {
  return ab(() => {
    var gradeUrl = API_PREFIX + '/v1/courses/' + courseId + '/gradebook/columns/' + forumMessage.gradedColumn.id + '/grades?userId=' + userId;
    var gradeDetail = makeApiCall({url: gradeUrl, method: 'GET'}, authInfo).sync();
    var gradeId = gradeDetail.results[0].id;

    var feedback = {
      rawText: feedbackText,
      displayText: ''
    };

    return addFeedbackToGrade(
      {
        instructorFeedback: feedback,
        courseId: courseId,
        columnId: forumMessage.gradedColumn.id,
        gradeId: gradeId
      },
      authInfo,
      callback).sync();
  }, callback);
}

export function startConversionTask(courseId: string, authInfo: IAuthInfo, callback?: Function) {
  return ab((flow) => {

    var conversionTask = makeApiCall({
      url: API_PREFIX + '/v1/courses/' + courseId + '/convertToUltra/conversionStatus',
      method: 'GET'
    }, authInfo).sync();

    //start the task now, so we aren't waiting for it to start
    if (conversionTask.taskStatus === 'WAITING') {
      conversionTask = runSystemTaskNow({taskId: conversionTask.taskId}, authInfo).sync();
    }
    //poll and wait for it to complete
    var wait = 2000; //poll wait time
    var loopIter = 0;
    var maxLoop = 60 * 1000 / wait; //60 seconds of polling

    while ((conversionTask.taskStatus === 'RUNNING' || conversionTask.taskStatus === 'WAITING') && loopIter < maxLoop) {
      loopIter++;
      setTimeout(flow.add(), wait);
      flow.wait();
      conversionTask = getSystemTask({taskId: conversionTask.taskId}, authInfo).sync();
    }

    if (conversionTask.taskStatus !== 'COMPLETE') {
      throw new Error( 'Error starting conversion task, system task status responded as ' + conversionTask.taskStatus
      );
    }

    return conversionTask;
  }, callback);
}

export function createGoalSet(data: IGoalSet, authInfo: IAuthInfo, callback?: Function) {
  return ab(() => {
    let response = makeLegacyCall({
      url: GOAL_URL + 'createDocument',
      form: _.clone(data)
    }, authInfo).sync();
    return _.extend(data, response.returnData);
  }, callback);
}

export function createGoalCategory(data: IGoalCategory, authInfo: IAuthInfo, callback?: Function) {
  return ab(() => {
    let response = makeLegacyCall({
      url: GOAL_URL + 'createCategory',
      form: _.clone(data)
    }, authInfo).sync();
    return _.extend(data, response.returnData);
  }, callback);
}

export function createGoal(data: IGoal, authInfo: IAuthInfo, callback?: Function) {
  return ab(() => {
    let response = makeLegacyCall({
      url: GOAL_URL + 'createStandard',
      form: _.clone(data)
    }, authInfo).sync();
    data.title = data.stdId;
    return _.extend(data, response.returnData);
  }, callback);
}

export function deleteGoal(id: string, cmd: string, authInfo: IAuthInfo, callback?: Function) {
  return ab(() => {
    return makeLegacyCall({
      url: GOAL_URL + 'documentSubDocManagement',
      form: {
        id: id,
        cmd: cmd,
        removeAlignments: true
      }
    }, authInfo).sync();
  }, callback);
}

export function patchContent(options: IRequestOptions, authInfo: IAuthInfo, callback?: Function) {
  options.method = 'PATCH';
  return ab(() => makeApiCall(options, authInfo).sync(), callback);
}

export function setMessagesModeRelational(callback?: Function) {
  return ab(() => {
    return makeLegacyCall({
      method: 'GET',
      url: BASE_URL + '/webapps/blackboard/execute/composeMessage?method=persistenceType&useRelational=true'
    }, config.test.e2e.learnAdminAuth).sync();
  }, callback);
}

export function setMessageModeFlatFile(callback?: Function) {
  return ab(() => {
    return makeLegacyCall({
      method: 'GET',
      url: BASE_URL + '/webapps/blackboard/execute/composeMessage?method=persistenceType&useRelational=false'
    }, config.test.e2e.learnAdminAuth).sync();
  }, callback);
}

export function createIpModule(options: { ipModule: any }, authInfo: IAuthInfo, callback?: Function) {
  var ipModule = options.ipModule;

  return ab(() => {
    return makeApiCall({
      url: IP_API_PREFIX + '/module',
      body: ipModule
    }, authInfo).sync();
  }, callback);
}

export function deleteIpModule(options: { moduleId: string }, authInfo: IAuthInfo, callback?: Function) {
  var moduleId = options.moduleId;

  return ab(() => {
    return makeApiCall({
      method: 'DELETE',
      url: IP_API_PREFIX + '/module/' + moduleId + '?force=true'
    }, authInfo).sync();
  }, callback);
}

export function createIpModuleResources(options: { moduleId: string, resources: any }, authInfo: IAuthInfo, callback?: Function) {
  var resources = options.resources;
  var moduleId = options.moduleId;

  return ab(() => {
    return makeApiCall({
      url: IP_API_PREFIX + '/module/' + moduleId + '/resources?replace=true',
      body: resources
    }, authInfo).sync();
  }, callback);
}

setBaseUrl(config.test.e2e.baseUrl);