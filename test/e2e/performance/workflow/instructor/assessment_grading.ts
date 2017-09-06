import controls = require('../../../controls/index');
import testUtil = require('../../../test_util');
import dataSet = require('../../data-set-generator');

import {IProfiler, TestWorkflow} from '../../test-profiler';

export class Workflow extends TestWorkflow {
  execute(basePage: controls.BasePage.Control, profile: IProfiler) {
    profile.start();

    let courseList = basePage.openCourses();
    profile.record('[Memory Leak Test] Opened Courses page');

    let courseOutline = courseList.openCourse(this.env[dataSet.COURSE_A].id).getOutline();
    profile.record('[Memory Leak Test] Opened course outline');

    let test = courseOutline.getContentItem(this.env[dataSet.FINAL_TEST].title);
    profile.record('Located assessment');

    this.executeMainWorkflow(test, profile);

    courseOutline.closePanel();
    profile.record('[Memory Leak Test] Returned to Courses page');

    profile.end();
  }

  executeWithoutMemoryLeakTests(courseList: controls.BaseCoursesPage.Control, profile: IProfiler) {
    let courseOutline = courseList.openCourse(this.env[dataSet.COURSE_A].id).getOutline();
    let test = courseOutline.getContentItem(this.env[dataSet.FINAL_TEST].title);

    profile.start();
    this.executeMainWorkflow(test, profile);
    profile.end();
  }

  private executeMainWorkflow(test: controls.ContentItem.Control, profile: IProfiler, isMemoryLeakTest: boolean = false) {
    let canvas = test.openAssessmentAsEditor();
    canvas.getQuestion(1); // Wait for the first question to finish rendering
    profile.record('Opened assessment');

    let submissionPanel = canvas.openSubmissionsPanel();
    let row = submissionPanel.getGradeRow(this.env[dataSet.STUDENT].id);
    profile.record('Viewed submission list');

    // TODO: This cannot be completed until ULTRA-19103 is complete
    //submissionPanel.scrollToLastSubmission(dataSet.STUDENTS);
    //profile.record('Scrolled to last submission');

    let submissionDetail = submissionPanel.openRow(row);
    let questionGradePill = submissionDetail.getQuestionGradeInput(0);
    profile.record('Opened last submission');

    submissionDetail.enterQuestionGrade({input: questionGradePill, index: 0, value: 1, skipPolledExpect: true});
    profile.record('Graded one question');

    submissionDetail.enterSubmissionGrade('1');
    profile.record('Set override grade');

    submissionDetail = submissionDetail.openNextSubmission();
    profile.record('Opened next submission');

    submissionDetail.close();
    profile.record('Closed submission');

    submissionPanel.postGrade(this.env[dataSet.STUDENT].id);
    profile.record('Posted grade');

    canvas.close();
    profile.record(isMemoryLeakTest ? '[[Memory Leak Test] ] Closed assessment' : 'Closed assessment');
  }
}