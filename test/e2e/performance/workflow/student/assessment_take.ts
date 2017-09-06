import controls = require('../../../controls/index');
import testUtil = require('../../../test_util');
import dataSet = require('../../data-set-generator');

import {IProfiler, TestWorkflow} from '../../test-profiler';

export class Workflow extends TestWorkflow {
  execute(basePage: controls.BasePage.Control, profile: IProfiler) {
    let questionCount = dataSet.QUESTION_COUNT_PER_TYPE * dataSet.QUESTION_TYPES;

    profile.start();

    let courseList = basePage.openCourses();
    profile.record('[Memory Leak Test] Opened Courses page');

    let courseOutline = courseList.openCourse(this.env[dataSet.COURSE_A].id).getOutline();
    profile.record('[Memory Leak Test] Opened course outline');

    let test = courseOutline.getContentItem(this.env[dataSet.EDITABLE_TEST].title);
    profile.record('Located assessment');

    this.executeMainWorkflow(test, profile);

    courseOutline.closePanel();
    profile.record('[Memory Leak Test] Returned to Courses page');

    profile.end();
  }

  executeWithoutMemoryLeakTests(courseList: controls.BaseCoursesPage.Control, profile: IProfiler) {
    let courseOutline = courseList.openCourse(this.env[dataSet.COURSE_A].id).getOutline();
    let test = courseOutline.getContentItem(this.env[dataSet.EDITABLE_TEST].title);

    profile.start();
    this.executeMainWorkflow(test, profile);
    profile.end();
  }

  private executeMainWorkflow(test: controls.ContentItem.Control, profile: IProfiler, isMemoryLeakTest: boolean = false) {
    let overview = test.openAssessmentAsViewer();
    profile.record('Overview peek opened');

    let canvas = overview.startAttempt();
    let answers = canvas.getAnswers();
    profile.record('Assessment canvas opened');

    answers.answerEssayQuestion({questionIndex: 0, text: 'essay question answer 0'});
    profile.record(`Essay question answered`);

    answers.answerMultipleChoiceQuestion({questionIndex: 1, answerIndex: 1});
    profile.record(`Multiple choice question answered`);

    answers.answerTrueFalseQuestion({questionIndex: 2, answer: true});
    profile.record(`True/False question answered`);

    canvas.submit();
    profile.record('Assessment submitted');

    overview.close();
    profile.record(isMemoryLeakTest ? '[Memory Leak Test] Closed overview peek' : 'Closed overview peek');
  }
}