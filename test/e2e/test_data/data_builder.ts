import _ = require('lodash');
import angular = require('angular');
import Chance = require('chance');
import enums = require('../controls/enums/index');
import models = require('../../../app/components/models');
import testUtil = require('../../utility/util');
import {ElementFinderSync, browserSync, elementSync, polledExpect, waitFor} from 'protractor-sync';

var chance = new Chance();

function getRandomId() {
  return chance.natural({ max: 99999999999 });
}

export function generateUser(type: string, overrides?: any) {
  var random = getRandomId();

  return <models.user.ILearnUser>_.extend({
    givenName: testUtil.PREFIX + 'user_' + type,
    familyName: testUtil.PREFIX + random,
    userName: testUtil.PREFIX + 'user_' + random,
    //Learn currently has a bug where it sets the password to be the username when creating users
    password: testUtil.PREFIX + 'user_' + random
  }, overrides || {});
}

export function generateCourse(ultraStatus: any, overrides?: any) {
  var random = getRandomId();

  return <models.course.ILearnCourse>_.extend({
    name: testUtil.PREFIX + 'course_' + random,
    courseId: testUtil.PREFIX + random,
    isAvailable: true,
    isOrganization: false,
    ultraStatus: ultraStatus
  }, overrides || {});
}

export function generateIpModule(overrides?: any) {
  var random = getRandomId();

  return _.extend({
    available: false,
    customPageId: '',     // this is a necessary parameter, which need to be passed in overrides, need call testUtil.getCustomPage('IP') to get the custom page id.
    sequence: 0,
    title: testUtil.PREFIX + 'module_' + random,
    type: 'LINKS'
  }, overrides || {});
}

export function generateIpModuleResource(moduleId: string, type: string, overrides?: any) {
  var random = getRandomId();
  var resource = null;
  // type only has two values 'IMAGE' and 'LINK'
  if (type === 'IMAGE') {
    resource = _.extend({
      available: true,
      moduleId: moduleId,
      sequence: 1,
      type: 'IMAGE',
      details: {
        href: '',
        title: testUtil.PREFIX + ' module title ' + random,
        desc: testUtil.PREFIX + ' module description ' + random
      }
    }, overrides || {});
  } else {
    resource = _.extend({
      available: true,
      moduleId: moduleId,
      sequence: 2,
      type: 'LINK',
      details: {
        href: 'http://test.blackboard.com',
        title: testUtil.PREFIX + ' link ' + random,
      }
    }, overrides || {});
  }

  return resource;
}

export function generateMembership(userId: string, courseId: string, role: any, overrides?: any) {
  return <models.courseMembership.ICourseMembership>_.extend({
    userId: userId,
    isAvailable: true,
    role: role
  }, overrides || {});
}

export function generateGroup(overrides?: any) {
  var random = getRandomId();
  return _.extend({
    title: testUtil.PREFIX + 'group_' + random,
    isAvailable: true,
    memberships: []
  }, overrides || {});
}

export function generateCalendarItem(calendarId: string, overrides?: any) {
  var random = getRandomId();
  var date = new Date();
  return {
    calendarId: calendarId,
    title: overrides && overrides.title || testUtil.PREFIX + ' calendar item ' + random,
    endDate: overrides && overrides.endDate || new Date(date.getFullYear(), date.getMonth(), date.getDate(), 11),
    startDate: overrides && overrides.startDate || new Date(date.getFullYear(), date.getMonth(), date.getDate(), 10),
    // these two fields are required by the interface, but not required or expected by the REST API
    itemSourceId: '',
    itemSourceType: ''
  };
}

export function generateOfficeHours(calendarId: string, overrides?: any) {
  var random = getRandomId();
  var date = new Date();
  return {
    calendarId: calendarId,
    title: overrides && overrides.title || testUtil.PREFIX + ' calendar item ' + random,
    endDate: overrides && overrides.endDate || new Date(date.getFullYear(), date.getMonth(), date.getDate(), 10),
    startDate: overrides && overrides.startDate || new Date(date.getFullYear(), date.getMonth(), date.getDate(), 9),
    recurRules: overrides && overrides.recurRules || {freq: 'DAILY', interval: 1, endsBy: null, count: 1, byWeekDay: []},  //defaults to one-time 10-11AM event today
    // these two fields are required by the interface, but not required or expected by the REST API
    itemSourceId: '',
    itemSourceType: ''
  };
}

export function generateCourseSchedule(calendarId: string, overrides?: any) {
  var random = getRandomId();
  var date = new Date();
  return {
    calendarId: calendarId,
    title: testUtil.PREFIX + ' calendar item ' + random,
    endDate: overrides && overrides.endDate || new Date(date.getFullYear(), date.getMonth(), date.getDate(), 11),
    startDate: overrides && overrides.startDate || new Date(date.getFullYear(), date.getMonth(), date.getDate(), 10),
    recurRules: overrides && overrides.recurRules || {freq: 'WEEKLY', interval: 1, count: 10, byWeekDay: ['MO', 'TU']},
    // these two fields are required by the interface, but not required or expected by the REST API
    itemSourceId: '',
    itemSourceType: ''
  };
}

export function generateCourseContentTitle(contentHandler: enums.ContentHandler) {
  var random = getRandomId();
  var type: string;

  switch (contentHandler) {

    case enums.ContentHandler.UltraAssignment:
      type = 'ultraassignment_';
      break;
    case enums.ContentHandler.File:
      type = 'file_';
      break;
    case enums.ContentHandler.Folder:
      type = 'folder_';
      break;
    case enums.ContentHandler.ExternalLink:
      type = 'externalLink_';
      break;
    case enums.ContentHandler.Discussion:
      type = 'discussion_';
      break;
    case enums.ContentHandler.LtiLink:
      type = 'ltiLink_';
      break;
    case enums.ContentHandler.TestLink:
      type = 'test_';
      break;
    case enums.ContentHandler.Document:
      type = 'document_';
      break;
    default:
      type = 'noType_';
      break;
  }

  return testUtil.PREFIX + type + random;
}

export function generateCourseContent(courseId: string,
  parentId: string,
  title: string,
  contentHandler: enums.ContentHandler,
  contentDetail: any,
  visibility: enums.Visibility,
  adaptiveReleaseRules?: any,
  positionBefore?: string,
  positionAfter?: string) {

  var isAvailable = visibility === enums.Visibility.Visible || visibility === enums.Visibility.Restricted;
  var isPartiallyVisible = visibility === enums.Visibility.Restricted;

  if (visibility === enums.Visibility.Restricted && adaptiveReleaseRules == null) {
    var now = new Date();
    adaptiveReleaseRules = {startDate: now, endDate: undefined};
  }

  return {
    title: title,
    contentHandler: contentHandler,
    courseId: courseId,
    isAvailable: isAvailable,
    isPartiallyVisible: isPartiallyVisible,
    adaptiveReleaseRules: adaptiveReleaseRules,
    parentId: parentId,
    contentDetail: contentDetail,
    positionBefore: positionBefore,
    positionAfter: positionAfter
  };
}

export function generateRubric(courseId: string, overrides?: any, assessmentId?: string) {

  var random = getRandomId();

  var rubric = {
    courseId: courseId,
    title: overrides && overrides.title || (testUtil.PREFIX + 'rubric_' + random),
    rows: overrides && overrides.rows || new Array<models.rubric.ILearnRubricRow>(),
    columnHeaders: overrides && overrides.columnHeaders || new Array<models.rubric.ILearnRubricColumnHeader>(),
    permissions: overrides && overrides.permissions || { edit: true, delete: true }
  };

  const rowCount = overrides && overrides.criteriaCount || 2;
  const columnCount = overrides && overrides.achievementCount || 2;
  if (!(overrides && overrides.rows)) {
    for (let rowIdx = 0; rowIdx < rowCount; rowIdx++) {
      const cells = new Array<models.rubric.ILearnRubricCell>();
      for (let colIdx = 0; colIdx < columnCount; colIdx++) {
        cells.push({
          position: colIdx,
          description: '',
          percentage: Math.floor(100 - (100 / columnCount * colIdx ))
        });
      }

      rubric.rows.push({
        position: rowIdx,
        header: testUtil.PREFIX + 'rubric_header_' + random,
        percentage: Math.floor(100 / rowCount),
        cells: cells
      });
    }
  }

  if (!(overrides && overrides.columnHeaders)) {
    for (let colIdx = 0; colIdx < columnCount; colIdx++) {
      rubric.columnHeaders.push({
        position: colIdx,
        header: testUtil.PREFIX + 'column_header' + random
      });
    }
  }

  return rubric;
}

export function generateRubricEvaluation(rubric: models.rubric.ILearnRubric, rubricAssociationId: string, maxScore: number) {

  var cells = new Array<models.rubricEvaluation.ILearnRubricEvaluationCell>();
  var totalScore = 0;

  rubric.rows.forEach((row) => {
    var selectedCell = row.cells[0];

    cells.push({
      rubricCellId: selectedCell.id,
      rubricRowId: row.id,
      selectedPercent: selectedCell.percentage
    });

    totalScore += maxScore * row.percentage / 100 * selectedCell.percentage / 100;
  });

  var rubricEvaluation = {
    cells: cells,
    maxScore: maxScore,
    overrideScore: -1,
    rubricAssociationId: rubricAssociationId,
    totalScore: totalScore
  };

  return rubricEvaluation;
}

export function generateInstructorFeedback() {
  var feedback = {
    rawText: chance.sentence(),
    displayText: ''
  };

  return feedback;
}

function _generateDefaultDueDate(): Date {
  var now = new Date();
  return new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1);
}

export function generateAssessmentDetail(courseId: string, contentHandler: enums.ContentHandler, overrides?: any) {
  var assessmentType = enums.AssessmentType.parseByContentHandler(contentHandler.toString());
  var deployedAssessmentType = enums.DeployedAssessmentType.parseByContentHandler(contentHandler.toString());
  var contentDetail : { [key: string] : any } = {};
  var content: any = {};
  var possible = overrides && overrides.possible || 0;

  content[deployedAssessmentType.toString()] = {
    deployedAssessmentType: deployedAssessmentType.toString(),
    assessment: {
      type: assessmentType.toString()
    },
    deploymentSettings:  {
      feedbackSettings: {
        as: {
          options: ['USER_ANSWERS', 'CORRECT_ANSWERS']
        }
      }
    },
    gradingColumn: {
      possible: possible,
      visible: true,
      courseId: courseId
    },
    permissions: {
      modify: true
    }
  };

  if (overrides) {
    content = _.merge(content, overrides);
  }

  if (!content[deployedAssessmentType.toString()].gradingColumn.dueDate) { // Default due date to tomorrow
    content[deployedAssessmentType.toString()].gradingColumn.dueDate = _generateDefaultDueDate();
  }

  contentDetail[contentHandler.toString()] = content;
  return contentDetail;
}

export function generateFolderDetail() {
  var contentDetail : { [key: string] : any } = {};

  var detail = {
      isFolder : true
    };

  contentDetail['resource/x-bb-folder'] = detail;
  return contentDetail;
}

export function generateDocumentDetail() {
  var contentDetail : { [key: string] : any } = {};

  var detail = {
    isFolder : true,
    isBbPage: true
  };

  contentDetail['resource/x-bb-folder'] = detail;
  return contentDetail;
}

export function generateFileContentDetail(args: {uploadedFile: models.file.ILearnFile; overrides?: any}) {
  var fileContentDetail: { [key: string] : any } = {};
  fileContentDetail[enums.ContentHandler.File.toString()] = {
    file: args.uploadedFile
  };

  return _.extend(fileContentDetail, args && args.overrides || {});
}

export function generateDiscussionContentDetail(title: string) {
  var contentDetail : { [key: string] : any } = {};

  var detail = {
    title : title
  };

  contentDetail[enums.ContentHandler.Discussion.toString()] = detail;
  return contentDetail;
}

export function generateCourseLinkContentDetail(contentId: string) {
  var contentDetail : { [key: string] : any } = {};

  var detail = {
    linkSourceId: contentId,
    linkSourceTable: 'CONTENT'
  };

  contentDetail['resource/x-bb-courselink'] = detail;
  return contentDetail;
}

export function generateQuestionForAssessment(title: string, questionType: enums.QuestionType, overrides?: any): models.question.IQuestion {
  var question = <models.question.IQuestion>{
    title: title,
    questionText: {
      rawText: '<p>' + testUtil.PREFIX + getRandomId() + '</p>',
      displayText: ''
    },
    questionType: questionType,
    points: 100
  };

  if (overrides && overrides.longQuestionText) {
    question.questionText.rawText += `
      Sed ut perspiciatis unde omnis iste natus error sit voluptatem accusantium doloremque laudantium, totam rem aperiam, eaque ipsa quae 
      ab illo inventore veritatis et quasi architecto beatae vitae dicta sunt explicabo. Nemo enim ipsam voluptatem quia voluptas sit aspernatur 
      aut odit aut fugit, sed quia consequuntur magni dolores eos qui ratione voluptatem sequi nesciunt. Neque porro quisquam est, qui dolorem 
      ipsum quia dolor sit amet, consectetur, adipisci velit, sed quia non numquam eius modi tempora incidunt ut labore et dolore magnam aliquam 
      quaerat voluptatem. Ut enim ad minima veniam, quis nostrum exercitationem ullam corporis suscipit laboriosam, nisi ut aliquid ex ea commodi 
      consequatur? Quis autem vel eum iure reprehenderit qui in ea voluptate velit esse quam nihil molestiae consequatur, vel illum qui dolorem eum 
      fugiat quo voluptas nulla pariatur?
      At vero eos et accusamus et iusto odio dignissimos ducimus qui blanditiis praesentium voluptatum deleniti atque corrupti quos dolores et quas 
      molestias excepturi sint occaecati cupiditate non provident, similique sunt in culpa qui officia deserunt mollitia animi, id est laborum et 
      dolorum fuga. Et harum quidem rerum facilis est et expedita distinctio. Nam libero tempore, cum soluta nobis est eligendi optio cumque nihil 
      impedit quo minus id quod maxime placeat facere possimus, omnis voluptas assumenda est, omnis dolor repellendus. Temporibus autem quibusdam et 
      aut officiis debitis aut rerum necessitatibus saepe eveniet ut et voluptates repudiandae sint et molestiae non recusandae. Itaque earum rerum 
      hic tenetur a sapiente delectus, ut aut reiciendis voluptatibus maiores alias consequatur aut perferendis doloribus asperiores repellat.
      Sed ut perspiciatis unde omnis iste natus error sit voluptatem accusantium doloremque laudantium, totam rem aperiam, eaque ipsa quae 
      ab illo inventore veritatis et quasi architecto beatae vitae dicta sunt explicabo. Nemo enim ipsam voluptatem quia voluptas sit aspernatur 
      aut odit aut fugit, sed quia consequuntur magni dolores eos qui ratione voluptatem sequi nesciunt. Neque porro quisquam est, qui dolorem 
      ipsum quia dolor sit amet, consectetur, adipisci velit, sed quia non numquam eius modi tempora incidunt ut labore et dolore magnam aliquam 
      quaerat voluptatem. Ut enim ad minima veniam, quis nostrum exercitationem ullam corporis suscipit laboriosam, nisi ut aliquid ex ea commodi 
      consequatur? Quis autem vel eum iure reprehenderit qui in ea voluptate velit esse quam nihil molestiae consequatur, vel illum qui dolorem eum 
      fugiat quo voluptas nulla pariatur?
      At vero eos et accusamus et iusto odio dignissimos ducimus qui blanditiis praesentium voluptatum deleniti atque corrupti quos dolores et quas 
      molestias excepturi sint occaecati cupiditate non provident, similique sunt in culpa qui officia deserunt mollitia animi, id est laborum et 
      dolorum fuga. Et harum quidem rerum facilis est et expedita distinctio. Nam libero tempore, cum soluta nobis est eligendi optio cumque nihil 
      impedit quo minus id quod maxime placeat facere possimus, omnis voluptas assumenda est, omnis dolor repellendus. Temporibus autem quibusdam et 
      aut officiis debitis aut rerum necessitatibus saepe eveniet ut et voluptates repudiandae sint et molestiae non recusandae. Itaque earum rerum 
      hic tenetur a sapiente delectus, ut aut reiciendis voluptatibus maiores alias consequatur aut perferendis doloribus asperiores repellat.
      Sed ut perspiciatis unde omnis iste natus error sit voluptatem accusantium doloremque laudantium, totam rem aperiam, eaque ipsa quae 
      ab illo inventore veritatis et quasi architecto beatae vitae dicta sunt explicabo. Nemo enim ipsam voluptatem quia voluptas sit aspernatur 
      aut odit aut fugit, sed quia consequuntur magni dolores eos qui ratione voluptatem sequi nesciunt. Neque porro quisquam est, qui dolorem 
      ipsum quia dolor sit amet, consectetur, adipisci velit, sed quia non numquam eius modi tempora incidunt ut labore et dolore magnam aliquam 
      quaerat voluptatem. Ut enim ad minima veniam, quis nostrum exercitationem ullam corporis suscipit laboriosam, nisi ut aliquid ex ea commodi 
      consequatur? Quis autem vel eum iure reprehenderit qui in ea voluptate velit esse quam nihil molestiae consequatur, vel illum qui dolorem eum 
      fugiat quo voluptas nulla pariatur?
      At vero eos et accusamus et iusto odio dignissimos ducimus qui blanditiis praesentium voluptatum deleniti atque corrupti quos dolores et quas 
      molestias excepturi sint occaecati cupiditate non provident, similique sunt in culpa qui officia deserunt mollitia animi, id est laborum et 
      dolorum fuga. Et harum quidem rerum facilis est et expedita distinctio. Nam libero tempore, cum soluta nobis est eligendi optio cumque nihil 
      impedit quo minus id quod maxime placeat facere possimus, omnis voluptas assumenda est, omnis dolor repellendus. Temporibus autem quibusdam et 
      aut officiis debitis aut rerum necessitatibus saepe eveniet ut et voluptates repudiandae sint et molestiae non recusandae. Itaque earum rerum 
      hic tenetur a sapiente delectus, ut aut reiciendis voluptatibus maiores alias consequatur aut perferendis doloribus asperiores repellat.
      Sed ut perspiciatis unde omnis iste natus error sit voluptatem accusantium doloremque laudantium, totam rem aperiam, eaque ipsa quae 
      ab illo inventore veritatis et quasi architecto beatae vitae dicta sunt explicabo. Nemo enim ipsam voluptatem quia voluptas sit aspernatur 
      aut odit aut fugit, sed quia consequuntur magni dolores eos qui ratione voluptatem sequi nesciunt. Neque porro quisquam est, qui dolorem 
      ipsum quia dolor sit amet, consectetur, adipisci velit, sed quia non numquam eius modi tempora incidunt ut labore et dolore magnam aliquam 
      quaerat voluptatem. Ut enim ad minima veniam, quis nostrum exercitationem ullam corporis suscipit laboriosam, nisi ut aliquid ex ea commodi 
      consequatur? Quis autem vel eum iure reprehenderit qui in ea voluptate velit esse quam nihil molestiae consequatur, vel illum qui dolorem eum 
      fugiat quo voluptas nulla pariatur?
      At vero eos et accusamus et iusto odio dignissimos ducimus qui blanditiis praesentium voluptatum deleniti atque corrupti quos dolores et quas 
      molestias excepturi sint occaecati cupiditate non provident, similique sunt in culpa qui officia deserunt mollitia animi, id est laborum et 
      dolorum fuga. Et harum quidem rerum facilis est et expedita distinctio. Nam libero tempore, cum soluta nobis est eligendi optio cumque nihil 
      impedit quo minus id quod maxime placeat facere possimus, omnis voluptas assumenda est, omnis dolor repellendus. Temporibus autem quibusdam et 
      aut officiis debitis aut rerum necessitatibus saepe eveniet ut et voluptates repudiandae sint et molestiae non recusandae. Itaque earum rerum 
      hic tenetur a sapiente delectus, ut aut reiciendis voluptatibus maiores alias consequatur aut perferendis doloribus asperiores repellat.
    `;
  }

  switch (questionType) {
    case enums.QuestionType.Essay:
      return generateEssayQuestion(question, overrides);
    case enums.QuestionType.Multiple:
      return generateMultipleChoiceQuestion(question, overrides);
    case enums.QuestionType.Either:
      return generateTrueFalseQuestion(question, overrides);
    default:
      return question;
  }
}

function generateEssayQuestion(question: models.question.IQuestion, overrides?: any) {
  return <models.question.IEssayQuestion>_.extend(question, {
    isShortAnswer: true
  }, overrides);
}

function generateMultipleChoiceQuestion(question: models.question.IQuestion, overrides?: any) {
  return <models.question.IMultipleAnswerQuestion>_.extend(question, {
    questionType: 'multipleanswer',
    answers: [
      {answerText: {rawText: '<p>answer choice 1</p>'}, correctAnswer: false},
      {answerText: {rawText: '<p>answer choice 2</p>'}, correctAnswer: true},
      {answerText: {rawText: '<p>answer choice 3</p>'}, correctAnswer: false}
    ],
    answersCount: 3
  }, overrides);
}

function generateTrueFalseQuestion(question: models.question.IQuestion, overrides?: any) {
  return <models.question.ITrueFalseQuestion>_.extend(question, {
    answerType: 'true_false',
    answer: true
  }, overrides);
}

export function generateQuestionAttempt(questionAttempt: models.questionAttempt.ISourceQuestionAttempt, overrides?: any) {
  switch (enums.QuestionType.parse(questionAttempt.questionType.toString())) {
    case enums.QuestionType.Essay:
      return generateEssayQuestionAttempt(questionAttempt, overrides);
    case enums.QuestionType.Multiple:
      return generateMultipleAnswerQuestionAttempt(questionAttempt, overrides);
    default:
      return questionAttempt;
  }
}

function generateEssayQuestionAttempt(questionAttempt: models.questionAttempt.ISourceQuestionAttempt, overrides?: any) {
  return _.merge(questionAttempt, {
    givenAnswer: {
      rawText: testUtil.PREFIX + 'submission_' + getRandomId(),
      displayText: ''
    }
  }, overrides);
}

function generateMultipleAnswerQuestionAttempt(questionAttempt: models.questionAttempt.ISourceQuestionAttempt, overrides?: any) {
  return _.merge(questionAttempt, overrides);
}

export function generateConversation(courseId: string, to: string[]) {
  var random = getRandomId();

  return {
    canBeRepliedTo: true,
    courseId: courseId,
    isBroadcast: false,
    messages: [
      {
        body: {
          rawText: testUtil.PREFIX + random,
          displayText: ''
        }
      }
    ],
    participantIds: to
  };
}

export function generateOrganization(ultraStatus: any, overrides?: any) {
  var random = getRandomId();

  return <models.course.ILearnCourse>_.extend({
    name: testUtil.PREFIX + 'course_' + random,
    courseId: testUtil.PREFIX + random,
    isAvailable: true,
    isOrganization: true,
    ultraStatus: ultraStatus
  }, overrides || {});
}

export function generateTerm(overrides?: any) {
  var random = getRandomId();
  var date = new Date();

  return <models.term.ILearnTerm>_.extend({
    name: testUtil.PREFIX + 'term_' + random,
    isAvailable: true,
    durationType: enums.TermDuration.Continuous
  }, overrides || {});
}

export function generateReply(conversationId: string) {
  var random = getRandomId();

  return {
    conversationId: conversationId,
    body: {
      rawText: testUtil.PREFIX + random,
      displayText: ''
    }
  };
}

export function generateExternalLinkDetail(args?: { url?: string }) {
  var url = args && args.url || browserSync.getBrowser().baseUrl + '/ultra/stream';
  var contentType = enums.ContentHandler.ExternalLink.toString();

  var contentDetail: any = {};

  contentDetail[contentType] = {
    url: url
  };

  return contentDetail;
}

export function generateTargetedNotification(overrides?: any) {
  var random = getRandomId();
  var now = new Date();
  return {
    audience: {
      insRoles: overrides && overrides.insRoles || ['_1_1']
    },
    body: {
      rawText: overrides && overrides.rawText || (testUtil.PREFIX + random)
    },
    startDateRestriction: (overrides && overrides.startDateRestriction || now),    // default start date is now.
    endDateRestriction: (overrides && overrides.endDateRestriction || new Date(now.getTime() + 90 * 24 * 3600 * 1000)),     // default end date is 3 month later
    permanent: false,
    priority: (overrides && overrides.priority || 'STANDARD'),
    title: (overrides && overrides.title || (testUtil.PREFIX + random)),
    type: 'SYSTEM'
  };
}

export function generateAttempt(contentHandler: string, groupId?: string) {
  var scoreProviderHandle = enums.ScoreProviderHandle.parseByContentHandler(contentHandler);
  var attempt: any = {
    scoreProviderHandle: scoreProviderHandle.toString(),
    toolAttemptDetail: {}
  };
  if (groupId) {
    attempt.groupId = groupId;
  }
  var assessmentType = enums.AssessmentType.parseByContentHandler(contentHandler);
  (<any>attempt.toolAttemptDetail)[scoreProviderHandle.toString()] = {
    type: assessmentType.toString()
  };

  return attempt;
}

export function generateAttachmentQuestionAttempt(args: {questionAttempt: models.questionAttempt.ISourceQuestionAttempt; fileName : string; fileLocation: string}) {
  return _.extend(args.questionAttempt, {
    attachments: [
      {
        file: {
          fileName: args.fileName,
          fileLocation: args.fileLocation
        }
      }
    ]
  });
}

export function generateFileBbml(file: models.courseContent.ILearnSingleFile) {
  var render = file.isMedia ? 'inline' : 'attachment';
  return '<a href="' + file.webLocation + file.fileName + '" ' +
            'data-bbfile="{&quot;render&quot;:&quot;' + render + '&quot;,' +
                          '&quot;linkName&quot;:&quot;' + file.fileName + '&quot;,' +
                          '&quot;mimeType&quot;:&quot;' + file.mimeType + '&quot;}" ' +
            'data-bbid="bbml-editor-id_' + getRandomId() + '">' + file.fileName + '</a>';
}

export function generateTextBbml(text: string) {
  return '<div data-bbid="bbml-editor-id_' + getRandomId() + '"><p>' + text + '</p></div>';
}

export function generateScore(overrides?: any, overrideGrade?: boolean) {
  var result: any;
  if (overrideGrade) {
    result = {
      manualScore: chance.natural({ max: 100 })
    };
  } else {
    result = {
      readyToPost: true,
      score: chance.natural({ max: 100 })
    };
  }
  if (overrides) {
    result = _.extend(result, overrides);
  }
  return result;
}

export function generateMathMLFormulaBy1Item(args: any): models.gradebook.ICalculatedFormula {
  var PLACEHOLDER_WGT = 'PLACEHOLDER_WGT';
  var formula = '<math xmlns="http://www.w3.org/1998/Math/MathML"><mi>@X@BBCalColElem(wgt:PLACEHOLDER_WGT)@X@</mi></math>';
  var aliases: {[key: string]: string} = {};
  if (args.gradeItem) {
    var alias = 'i_' + args.gradeItem.split('_')[1];
    aliases[alias] = args.gradeItem;
    var element = {
      type: 'item',
      alias: alias
    };
    var formulaWeight = {
      element: element,
      weight: 100
    };
    var formulaWgt = {
      running: true,
      weights: [formulaWeight]
    };
    var calculatedFormula = {
      formula: formula.replace(PLACEHOLDER_WGT, JSON.stringify(formulaWgt)),
      aliases: aliases
    };
  }
  return <models.gradebook.ICalculatedFormula>calculatedFormula;
}

export function generateGradeAttempt(overrides?: any) {
  var result: any = {
    readyToPost: true,
    score: chance.natural({max: 100})
  };
  if (overrides) {
    result = _.extend(result, overrides);
  }
  return result;
}

export function generateGradeDetail(overrides?: any): models.gradeDetail.IGradeDetail {
  var result = {};
  if (overrides) {
    result = _.merge(result, overrides);
  }
  return <models.gradeDetail.IGradeDetail>result;
}

export function generateOverallGrade(args?: any) {
  var defaults = {
    columnName: 'Overall Grade',
    description: {
      rawText: '',
      displayText: ''
    },
    externalGrade: false,
    position: 0,
    positionBeforeId: 'start',
    possible: 0,
    visible: true,
    scorable: false,
    calculationType: 'CUSTOM',
    calculatedFormula: ''
  };
  var result = args ? _.merge(defaults, args) : defaults;
  return <models.gradeColumn.ISourceGradeColumn>result;
}

export function generateGradeColumn(args?: any) {
  var name = testUtil.PREFIX + 'offline_item_ ' + getRandomId();
  var defaults = {
    columnName: name + ' name',
    description: {
    rawText: name + 'description',
      displayText: ''
    },
    dueDate: _generateDefaultDueDate(),
    externalGrade: false,
    possible: 10,
    visible: true,
    visibleInBook: true
  };
  var result = args ? _.merge(defaults, args) : defaults;
  return <models.gradeColumn.ISourceGradeColumn>result;
}

export function generateDiscussion(courseId: string, forumId: string, userId: string, username: string, title?: string, parentId?: string, postFirst?: boolean) {
  var defaultName = testUtil.PREFIX + 'discussion_' + getRandomId();
  return <any>{
    subject: title || defaultName,
    body: {
      rawText: '<p>discussion content<p>',
      displayText: ''
    },
    courseId: courseId,
    forumId: forumId,
    editDate: new Date(),
    isDeleted: false,
    parentId: parentId || '{unset id}',
    postDate: new Date(),
    postedName: username,
    userId: userId,
    postFirst: postFirst || false
  };
}

export function generateCourseConversation(courseId: string, forumId: string, userId: string, username: string) {
  return <any>{
    body: {
      rawText: '',
      displayText: ''
    },
    courseId: courseId,
    forumId: forumId,
    //editDate: new Date(),
    isDeleted: false,
    //parentId: parentId || '{unset id}',
    postDate: new Date(),
    postedName: username,
    userId: userId
  };
}

export function generateComment(forumId: string, userId: string, username: string, parentId: string, commentContent?: string) {
  var defaultCommentContent = testUtil.PREFIX + 'comment_' + getRandomId();
  commentContent = commentContent || defaultCommentContent;
  return <any>{
    subject: null,
    body: {
      rawText: '<p>' + commentContent + '<p>',
      displayText: ''
    },
    forumId: forumId,
    editDate: new Date(),
    isDeleted: false,
    parentId: parentId,
    postDate: new Date(),
    postedName: username,
    userId: userId
  };
}

export function generateStreamSettingPreference(args?: {overrides?: any}) {
  var defaultPreference = {
    key: 'ultraui.stream.settings',
    value: {
      TCH: {
        CAL: 'Y',
        MES: 'Y',
        GRB: 'Y',
        DIS: 'Y'
      },
      LRN: {
        CAL: 'Y',
        CON: 'Y',
        GRA: 'Y',
        MES: 'Y',
        DIS: 'Y',
        TEL: 'Y'
      }
    },
    isRequired: true
  };
  // TODO: Use any cast before we update the type definition for lodash in node-shared-typescript-defs.
  // Once defaultsDeep() is added in type definition, remove this any cast and this comment.
  var assignedPreference = (<any>_).defaultsDeep(args.overrides, defaultPreference);
  var stringifiedValue = JSON.stringify(assignedPreference.value);
  assignedPreference.value = stringifiedValue;
  return <any>assignedPreference;
}

export function generateContentExchangeImportOptions(args?: {overrides?: any}) {
  return _.extend({
    cxAction: 'CX_ACTION_IMPORT',
    includeItems: [
      'alignments',
      'announcement',
      'availabilityRule',
      'assessment',
      'content',
      'calendar',
      'collabSessions',
      'glossary',
      'gradebookItems',
      'groups',
      'discussionBoard',
      'settings',
      'staffInformation',
      'tasks',
      'blog',
      'journal',
      'rubric',
      'customArea(bb-retention)',
      'customArea(bb-wiki)'
    ]
  }, args && args.overrides || {});
}

export function generateGoalSet(args?: any) {
  let random = getRandomId();
  return _.extend({
    fType: '{unset id}',
    fStatus: 'ACTIVE',
    docName: testUtil.PREFIX + 'set_' + random,
    docType: testUtil.PREFIX + 'type_' + random,
    docStatus: 'ACTIVE'
  }, args || {});
}

export function generateGoalCategory(args?: any) {
  return _.extend({
    subDocName: testUtil.PREFIX + 'category_' + getRandomId(),
    subDocStatus: true
  }, args || {});
}

export function generateGoal(args?: any) {
  let random = getRandomId();
  return _.extend({
    stdId: testUtil.PREFIX + 'goal_' + random,
    stdText: testUtil.PREFIX + 'text_' + random,
    stdType: testUtil.PREFIX + 'type_' + random,
    stdAlignmentStatus: 'Active',
    layer: 1,
    docEditable: true,
    addAnother: false,
    addChild: false
  }, args || {});
}
