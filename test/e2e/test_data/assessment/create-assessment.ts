import ab = require('asyncblock');
import createBase = require('../create_base');
import createContent = require('../course/content/create_content');
import createDiscussion = require('../course/content/create_discussion');
import createGeneric = require('../generic/create_generic');
import createQuestion = require('./create-question');
import createRubric = require('../course/rubric/create_rubric');
import createSubmission = require('./create-submission');
import dataApi = require('../data_api');
import dataBuilder = require('../data_builder');
import enums = require('../../controls/enums/index');
import models = require('../../../../app/components/models');
import {ILearnRubric} from '../../../../app/components/models/rubric/rubric-model';

export class CreateAssessment<T extends createBase.CreateBase> extends createContent.CreateContent<T> {

  questionCount = 1;

  private validate(args: { from: string; resultName?: string; overrides?: any}) {
    var assessment = this._getData();
    var isAssignment = assessment.contentHandler.toString() === enums.ContentHandler.UltraAssignment.toString();
    var isTest = assessment.contentHandler.toString() === enums.ContentHandler.TestLink.toString();

    if (!isAssignment && !isTest) {
      throw new Error('How did you get here? Cannot create submission for non-assessment');
    }

    if (isTest && (args.overrides)) {
      throw new Error('No support for test submission with overrides (for questionAttempts). Remove them from args');
    }
  }

  submission(args: {
    from: any;
    resultName?: string;
    doNotSubmit?: boolean;
    groupId?: string;
  }) {
    this.validate(args);

    var assessment = this._getData();
    var course = this.parent._getData();
    var from = typeof args.from === 'string' ? this._resolve(args.from) : args.from;
    var dataRecord = this._createDataRecord('submission', args && args.resultName);

    dataApi.createAttempt({
      assessment: assessment,
      courseId: course.id,
      groupId: args.groupId,
      doNotSubmit: args.doNotSubmit
    }, from, dataRecord.callback);

    return new createSubmission.CreateSubmission(this, dataRecord);
  }

  submissions(args: { count: number; from: any; }) {
    this.validate(args);

    var assessment = this._getData();
    var course = this.parent._getData();
    var from = typeof args.from === 'string' ? this._resolve(args.from) : args.from;

    var dataRecord = this._createDataRecord('submissions');

    dataApi.createAttempts(args.count, {
        assessment: assessment,
        courseId: course.id
    }, from, dataRecord.callback);

    return new createSubmission.CreateSubmission(this, dataRecord);
  }

  grade(args: { from: string; to: string; postGrade: boolean; resultName?: string; overrides?: any }) {
    var assessment = dataApi.getDeployedAssessment(this._getData());
    var course = this._resolve('course');
    var from = this._resolve(args.from);
    var to =  this._resolve(args.to);

    var dataRecord = this._createDataRecord('overrideGrade', args && args.resultName);
    var grade = dataBuilder.generateGradeDetail(args.overrides);
    dataApi.gradeGradeItem({
      courseId: course.id,
      columnId: assessment.gradingColumn.id,
      userId: to.id,
      postGrade: args.postGrade,
      grade: grade
    }, from, dataRecord.callback);

    return new createGeneric.CreateGeneric(this, dataRecord);
  }

  question(args: {questionType: enums.QuestionType; overrides?: any; resultName?: string}) {
    var assessment = this._getData();
    var course = this.parent._getData();

    var question = dataBuilder.generateQuestionForAssessment('Question ' + this.questionCount++, args.questionType, args.overrides);
    var dataRecord = this._createDataRecord('question', args && args.resultName);
    dataApi.createQuestion({
      question: question,
      courseId: course.id,
      assessmentId: dataApi.getDeployedAssessment(assessment).assessment.id
    }, this._adminAuth, dataRecord.callback);
    return new createQuestion.CreateQuestion(this, dataRecord);
  }

  // Creates a set of questions on an assessment and returns the assessment itself
  questions(args: {questionCount: number; questionTypes: enums.QuestionType[]; overrides?: any}) {
    var assessment = this._getData();
    var course = this.parent._getData();
    var questions: models.question.IQuestion[] = [];

    for (let i = 0; i < args.questionCount; i++) {
      var question = dataBuilder.generateQuestionForAssessment('Question ' + this.questionCount++, args.questionTypes[i], args.overrides);
      questions.push(question);
    }

    var dataRecord = this._createDataRecord('questions');
    dataApi.createQuestions({
      questionsToCreate: questions,
      courseId: course.id,
      assessmentId: dataApi.getDeployedAssessment(assessment).assessment.id
    }, this._adminAuth, dataRecord.callback);

    return new createGeneric.CreateGeneric(this, dataRecord);
  }

  /**
   * Attach an discussion to this assignment
   */
  classConversation(args: { from: string; resultName?: string }) {
    var assignment = this._getData();
    var course = this.parent._getData();
    var from = this._resolve(args.from);
    var dataRecord = this._createDataRecord('forumAttachedToAssignment', args && args.resultName);
    dataApi.enableForumOnContent({contentId: assignment.id, courseId: course.id}, from, dataRecord.callback);
    return new createDiscussion.CreateDiscussion(this, dataRecord);
  }

  rubricAssociation(args: { rubric: ILearnRubric; resultName?: string}) {
    var assessment = dataApi.getDeployedAssessment(this._getData());
    var course = this.parent._getData();

    var dataRecord = this._createDataRecord('rubricAssociation', args && args.resultName);

    dataApi.createRubricAssociation({
      rubric: args.rubric,
      courseId: course.id,
      columnId: assessment.gradingColumn.id
    }, this._adminAuth, dataRecord.callback);

    return new createGeneric.CreateGeneric(this, dataRecord);
  }

  timeLimit(args: { from: string; time: number; timerCompletion?: string}) {
    var assessment = this._getData();
    var course = this.parent._getData();
    var from = this._resolve(args.from); 

    var deploymentSettings = assessment.contentDetail['resource/x-bb-asmt-test-link'].test.deploymentSettings;
    deploymentSettings.timerCompletion = args.timerCompletion || 'H';
    deploymentSettings.timeLimit = args.time.toString();
       
    var dataRecord = this._createDataRecord('timeLimit');
    
    dataApi.enableTimeLimitOnContent({
      contentId: assessment.id, 
      courseId: course.id, 
      assessment: assessment
    }, 
      from, dataRecord.callback);

    return new createGeneric.CreateGeneric(this, dataRecord);
  }
}