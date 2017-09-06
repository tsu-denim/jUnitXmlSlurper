import controls = require('../../../controls/index');
import testUtil = require('../../../test_util');
import dataSet = require('../../data-set-generator');
import enums = require('../../../controls/enums/index');

import {IProfiler, TestWorkflow} from '../../test-profiler';

export class Workflow extends TestWorkflow {
  execute(basePage: controls.BasePage.Control, profile: IProfiler) {
    profile.start();

    let courseList = basePage.openCourses();
    profile.record('[Memory Leak Test] Opened Courses page');

    let courseOutline = courseList.openCourse(this.env[dataSet.COURSE_A].id).getOutline();
    profile.record('[Memory Leak Test] Opened course outline');

    let test = courseOutline.getContentItem(this.env[dataSet.EDITABLE_TEST].title);
    profile.record('Located assessment');

    let canvas = test.openAssessmentAsEditor();
    canvas.getQuestion(1); // Wait for the first question to finish rendering
    profile.record('Opened assessment');

    this.executeMainWorkflow(canvas, profile);

    canvas.close();
    profile.record('[Memory Leak Test] Closed assessment');

    courseOutline.closePanel();
    profile.record('[Memory Leak Test] Returned to Courses page');

    profile.end();
  }

  executeWithoutMemoryLeakTests(courseList: controls.BaseCoursesPage.Control, profile: IProfiler) {
    let courseOutline = courseList.openCourse(this.env[dataSet.COURSE_A].id).getOutline();
    let test = courseOutline.getContentItem(this.env[dataSet.EDITABLE_TEST].title);
    let canvas = test.openAssessmentAsEditor();
    canvas.getQuestion(1); // Wait for the first question to finish rendering

    profile.start();
    this.executeMainWorkflow(canvas, profile);
    profile.end();
  }

  private executeMainWorkflow(canvas: controls.EditAssessmentPanel.Control, profile: IProfiler) {
    canvas.getQuestion(1).editQuestion({questionText: 'Question 1 - New Text', questionType: enums.QuestionType.Essay});
    profile.record('Edited question text');

    canvas.getQuestion(1).editQuestion({points: '10', questionType: enums.QuestionType.Essay});
    profile.record('Edited question point');
  }
}