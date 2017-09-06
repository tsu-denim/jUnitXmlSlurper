import controls = require('../../../controls/index');
import testUtil = require('../../../test_util');
import dataSet = require('../../data-set-generator');
import config = require('../../../../../app/config');

import { IProfiler, TestWorkflow } from '../../test-profiler';
import { ElementFinderSync, browserSync, elementSync, polledExpect, waitFor } from 'protractor-sync';

const { by } = browserSync.getBrowser();

export class Workflow extends TestWorkflow {
  execute(basePage: controls.BasePage.Control, profile: IProfiler) {

    profile.start();
    let coursesList = basePage.openCourses();
    profile.record('[Memory Leak Test] Opened Courses page');

    let coursePage = coursesList.openCourse(this.env[dataSet.COURSE_A].id);
    profile.record('[Memory Leak Test] Opened course outline');

    let gradesPageAsGrader = coursePage.openGradesAsGrader();

    gradesPageAsGrader.assertListViewItemsIsLoad();
    profile.record('Opened gradebook tab');

    gradesPageAsGrader.scrollToLastGradeItem();
    // Verify the last data is loaded.
    gradesPageAsGrader.assertLoadingComplete();
    profile.record('Scrolled to last gradebook item');

    gradesPageAsGrader.scrollToTop();
    gradesPageAsGrader.openAddMenu();
    profile.record('Click add icons to open new offline peek panel -- Can be ignored');

    let offlinePanel = gradesPageAsGrader.newOfflineItem();
    // Verify the grade point input is loaded.
    offlinePanel.assertPageIsLoaded();
    profile.record('Opened new offline item peek panel');

    let offlineItemTitle = 'NewOffline' + new Date().getTime();
    offlinePanel.setItemName(offlineItemTitle).setMaximumScore('100');
    profile.record('Fill in offline grade item - can be ignored');
    offlinePanel.save();
    gradesPageAsGrader.assertColumnExists(offlineItemTitle);
    profile.record('Saved offline grade item');

    gradesPageAsGrader.openAddMenu();
    profile.record('Click add icons to open new calculation peek panel -- Can be ignored');

    let calculationPanel = gradesPageAsGrader.newCalculationPanel();
    // Verfiy the calculation elements are loaded.
    calculationPanel.assertPageIsLoad();
    profile.record('Opened new calculated grade item panel');

    let calculationTitle = 'NewCalculation' + new Date().getTime();
    calculationPanel.setTitle(calculationTitle).addAverageFromCategory();
    profile.record('Fill in calculated grade item - can be ignored');

    calculationPanel.save();
    calculationPanel.close();

    // Verify the new created calculated item is in grade book list.
    gradesPageAsGrader.assertColumnExists(calculationTitle);
    profile.record('Saved calculated grade item');

    if (config.features.gradeGridReborn) {
      let gridPage = gradesPageAsGrader.openGradeGridReborn();
      gridPage.assertLoadingComplete();
      profile.record('Switched to grid view');

      gridPage.clickFirstOfflineFirstStudentCell();
      profile.record('Clicked Grade Now');

      let score = Math.ceil(Math.random() * 10);
      gridPage.gradeFirstOfflineCell(score);
      // Verify the score is added to a student
      gridPage.assertFirstStudentFirstOfflineCell(score);
      profile.record('Added a score in the cell');

      // Scroll to next page
      gridPage.scrollDownToNextPage();
      profile.record('Scrolled down to next page');
      gridPage.scrollRightToNextPage();
      profile.record('Scrolled right to next page');

      gridPage.close();
      profile.record('Returned to Courses page');

      profile.end();
    } else {
      let gridPage = gradesPageAsGrader.openGradeGrid();
      // Verify the grid view cell is opened.
      gridPage.assertLoadingComplete();
      profile.record('Switched to grid view');

      // Verify the last cell is loaded.
      gridPage.scrollDownToBottom();
      profile.record('Scrolled down to last student');

      gridPage.scrollToRight();
      profile.record('Scrolled right to last gradable item');

      gridPage.clickLastCell();
      profile.record('Clicked Grade Now');

      let score = Math.ceil(Math.random() * 10);
      gridPage.gradeLastCell(score);
      // Verify the score is added to a student
      gridPage.assertLastCell(score);
      profile.record('Added a score in the cell');

      gridPage.close();
      profile.record('Returned to Courses page');

      profile.end();
    }
  }
}