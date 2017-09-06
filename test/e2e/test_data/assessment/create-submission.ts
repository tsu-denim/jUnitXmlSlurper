import ab = require('asyncblock');
import createBase = require('../create_base');
import createGeneric = require('../generic/create_generic');
import dataApi = require('../data_api');
import dataBuilder = require('../data_builder');
import enums = require('../../controls/enums/index');
import models = require('../../../../app/components/models');
import testUtil = require('../../../utility/util');

export class CreateSubmission<T extends createBase.CreateBase> extends createGeneric.CreateGeneric<T> {

  /**
   * Creates a response to an old Ultra Assignment. Old assignments were created as a single essay question.
   * They also allowed the ability for attachments directly to the essay question attempt. This is NOT the case for
   * current assessments (tests, assignments) in ultra. Use response() or responses() methods below if generating a response
   * for a question on a assignment or test.
   *
   * NOTE: REMOVE THIS WHEN OLD ASSIGNMENTS ARE DEPRECATED!!!!
   */
  oldAssignmentResponse(args?: { overrides?: any; responseData?: { fileName: string } }) {
    var student = this._resolve('student'); //response will always be from student
    var content = this.parent._getData();
    var course = this._resolve('course');
    var submission = this._getSubmission();

    var toolAttemptDetail = submission.toolAttemptDetail[enums.ScoreProviderHandle.parseByContentHandler(content.contentHandler).toString()];
    var questionAttempt = toolAttemptDetail.questionAttempts[0]; //only 1 essay question exists for old assignment.

    var flow = ab.getCurrentFlow();

    if (args && args.responseData) {
      if (args.responseData.fileName) {
        // If attachmentFileName is specified make it a attachment submission
        var docFilePath = testUtil.pathFromUltraUIRoot('test/dev_resources/files/' + args.responseData.fileName);
        var result = flow.sync(dataApi.uploadTempFile({filePath: docFilePath}, student, flow.callback()));
        questionAttempt = dataBuilder.generateAttachmentQuestionAttempt(
          {
            questionAttempt: questionAttempt,
            fileName: args.responseData.fileName,
            fileLocation: result.fileLocation
          }
        );
      }
    } else {
      questionAttempt = dataBuilder.generateQuestionAttempt(questionAttempt, args.overrides);
    }

    dataApi.updateQuestionAttempt({
      questionAttempt: questionAttempt,
      attempt: submission,
      courseId: course.id
    }, student, flow.callback());

    flow.wait(); //wait for questionAttempt to be updated before submit

    dataApi.submitAttempt({
      attempt: submission,
      contentHandler: content.contentHandler,
      courseId: course.id
    }, student);

    return new createGeneric.CreateGeneric(this, null);
  }

  /**
   * Adds a response to a question on an assessment.
   *
   * Note: args.to should be 'question' by default unless a resultName was passed in when creating question
   */
  response(args?: { submissionIndex?: number; to: string; overrides?: any; }) {
    //NOTE: response === questionAttempt
    var student = this._resolve('student'); //response will always be from student
    var content = this.parent._getData();
    var course = this._resolve('course');
    var question = this._resolve(args.to);
    var submission = this._getSubmission(args && args.submissionIndex);
    var toolAttemptDetail = submission.toolAttemptDetail[enums.ScoreProviderHandle.parseByContentHandler(content.contentHandler).toString()];
    var questionAttempt = toolAttemptDetail.questionAttempts.find((qAttempt: models.questionAttempt.ISourceQuestionAttempt) => qAttempt.questionId === question.id);
    var flow = ab.getCurrentFlow();

    flow.sync(dataApi.updateQuestionAttempt({
        questionAttempt: dataBuilder.generateQuestionAttempt(questionAttempt, args.overrides),
        attempt: submission,
        courseId: course.id
      }, student, flow.callback()));

    flow.wait(); //wait for questionAttempt to be updated before submit

    dataApi.submitAttempt({
      attempt: submission,
      contentHandler: content.contentHandler,
      courseId: course.id
    }, student);

    return new createGeneric.CreateGeneric(this, null);
  }

  /**
   * Adds response to multiple questions on an assessment.
   *
   * Note: args.to should be 'questions'
   */
  responses(args?: { submissionIndex?: number; to: string;  overrides?: { questionAttemptMap: { [questionId: string] : any } } }) {
    //NOTE: response === questionAttempt
    var student = this._resolve('student'); //responses will always be from student
    var content = this.parent._getData();
    var course = this._resolve('course');
    var questions = this._resolve(args.to);
    var submission = this._getSubmission(args && args.submissionIndex);
    var toolAttemptDetail = submission.toolAttemptDetail[enums.ScoreProviderHandle.parseByContentHandler(content.contentHandler).toString()];

    questions.forEach((question: models.question.IQuestion) => {
      var questionAttemptOverrides = args.overrides.questionAttemptMap[question.id];
      var questionAttempt = toolAttemptDetail.questionAttempts.find((qAttempt: models.questionAttempt.ISourceQuestionAttempt) => qAttempt.questionId === question.id);
      var flow = ab.getCurrentFlow();

      dataApi.updateQuestionAttempt({
          questionAttempt: dataBuilder.generateQuestionAttempt(questionAttempt, questionAttemptOverrides),
          attempt: submission,
          courseId: course.id
        }, student, flow.callback());

      flow.wait(); //wait for questionAttempt to be updated before submit

      dataApi.submitAttempt({
        attempt: submission,
        contentHandler: content.contentHandler,
        courseId: course.id
      }, student);
    });

    return new createGeneric.CreateGeneric(this, null);
  }

  /**
   * Adds freeform response to an assessment attempt.
   */
  freeform(args: { submissionIndex?: number; responseData: { fileName: string, text?: string } }) {
    var student = this._resolve('student'); //responses will always be from student
    var content = this.parent._getData();
    var course = this._resolve('course');
    var submission = this._getSubmission(args && args.submissionIndex);
    var flow = ab.getCurrentFlow();

    var bbmlData = {
      rawText: '',
      fileLocation: ''
    };

    if (args.responseData.fileName) {
      var filePath = testUtil.pathFromUltraUIRoot('test/dev_resources/files/' + args.responseData.fileName);
      var uploadedFile = flow.sync(dataApi.uploadTempFile({filePath: filePath}, student, flow.callback()));
      bbmlData.fileLocation = uploadedFile.fileLocation;
      bbmlData.rawText += dataBuilder.generateFileBbml(uploadedFile);
    } else if (args.responseData.text) {
      bbmlData.rawText += dataBuilder.generateTextBbml(args.responseData.text);
    }

    if (bbmlData.rawText !== '') {
      bbmlData.rawText = '<!-- {"bbMLEditorVersion":1} -->' + bbmlData.rawText;
    } else {
      bbmlData = null;
    }

    submission.studentSubmission = bbmlData; //set bbml on attempt

    dataApi.updateAttempt({
      courseId: course.id,
      attempt: submission
    }, student, flow.add('attempt'));

    flow.wait('attempt'); //wait for attempt to be updated before submit

    dataApi.submitAttempt({
      attempt: submission,
      contentHandler: content.contentHandler,
      courseId: course.id
    }, student, submission.callback);

    return new createGeneric.CreateGeneric(this, null);
  }

  grade(args: { from: string; isGroup?: boolean; postGrade?: boolean; resultName?: string; overrides?: any, overrideGrade?: boolean, submissionIndex?: number}) {
    var submission = this._getSubmission(args.submissionIndex);
    var assessment = this.parent._getData();
    var course = this._resolve('course');
    var from = this._resolve(args.from);
    var postGrade = args.postGrade;

    if (args.isGroup) {
      var group = {groupAssociationId: submission.groupAssociationId};
    }

    var dataRecord = this._createDataRecord('grade', args && args.resultName);
    var grade = dataBuilder.generateScore(args.overrides, args.overrideGrade);
    dataApi.createGrade(
      {
        grade: grade,
        submission: submission,
        assessment: assessment,
        courseId: course.id,
        postGrade: postGrade,
        group: group,
        override: args.overrideGrade
      },
      from,
      dataRecord.callback
    );

    return new createGeneric.CreateGeneric(this, dataRecord);
  }

  rubricEvaluation(args: { from: string; rubric: models.rubric.ILearnRubric; rubricAssociationId: string;
    isGroup?: boolean; postGrade?: boolean; resultName?: string; overrides?: any, overrideGrade?: boolean}) {
    var submission = this._getData();
    var assessment = this.parent._getData();
    var course = this._resolve('course');
    var from = this._resolve(args.from);
    var postGrade = args.postGrade;

    if (args.isGroup) {
      var group = {groupAssociationId: submission.groupAssociationId};
    }

    var dataRecord = this._createDataRecord('grade', args && args.resultName);
    var grade = dataBuilder.generateScore(args.overrides, args.overrideGrade);

    grade.rubricEvaluation = dataBuilder.generateRubricEvaluation(args.rubric, args.rubricAssociationId, dataApi.getDeployedAssessment(assessment).gradingColumn.possible);
    grade.score = grade.rubricEvaluation.totalScore;

    dataApi.createGrade(
      {
        grade: grade,
        submission: submission,
        assessment: assessment,
        courseId: course.id,
        postGrade: postGrade,
        group: group,
        override: args.overrideGrade
      },
      from,
      dataRecord.callback
    );

    return new createGeneric.CreateGeneric(this, dataRecord);
  }

  instructorFeedback(args?: {from: string; resultName?: string; overrides?: any}) {
    var course = this._resolve('course');
    var from = this._resolve(args.from);
    var submission = this._getData();
    var assessment = this.parent._getData();
    var column = dataApi.getDeployedAssessment(assessment).gradingColumn;

    var dataRecord = this._createDataRecord('grade', args && args.resultName);
    var feedback = dataBuilder.generateInstructorFeedback();

    dataApi.addFeedbackToAttempt(
      {
        instructorFeedback: feedback,
        courseId: course.id,
        columnId: column.id,
        gradeId: submission.gradeId,
        attemptId: submission.id,
        toolAttemptDetail: submission.toolAttemptDetail
      },
      from,
      dataRecord.callback);

    return new createGeneric.CreateGeneric(this, dataRecord);
  }

  private _getSubmission(index?: number) {
    var data = this._getData();
    return ( index != null && data instanceof Array ) ? data[index] : data;
  }
}