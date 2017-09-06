import controls = require('../../../controls/index');
import testUtil = require('../../../test_util');
import dataSet = require('../../data-set-generator');

import {IProfiler, TestWorkflow} from '../../test-profiler';
import {ElementFinderSync, browserSync, elementSync, polledExpect, waitFor} from 'protractor-sync';

export class Workflow extends TestWorkflow {
  execute(basePage: controls.BasePage.Control, profile: IProfiler) {
    profile.start();

    let courseList = basePage.openCourses();
    profile.record('[Memory Leak Test] Opened Courses page');

    let courseOutline = courseList.openCourse(this.env[dataSet.COURSE_A].id).getOutline();
    profile.record('Opened course outline');

    // Verify the course content data is loaded.
    elementSync.findElements('.outline-item-inner');
    profile.record('course outline content items rendered');

    courseOutline.scrollToLastContentItem();
    profile.record('Scrolled to last content item');

    var documentName = testUtil.PREFIX + 'Test Document';
    courseOutline.openLastAddMenu();
    profile.record('opened last add menu');

    courseOutline.openEditDocumentPanel();
    profile.record('opened edit document Panel');

    courseOutline.setDocumentOptions({title: documentName});
    profile.record('Finished entering data(ignore)');

    courseOutline.saveDocumentContent();
    profile.record('saved document and closed document');

    var newDocument = courseOutline.getContentItem(documentName).openAsDocument();
    profile.record('Reopened the document');

    newDocument.setVisible();
    profile.record('Made document visible to students');

    newDocument.close();
    profile.record('Closed document');

    courseOutline.moveItemUp(documentName);
    profile.record('moved document up');

    courseOutline.moveItemDown(documentName);
    profile.record('moved document down');

    courseOutline.closePanel();
    profile.record('[Memory Leak Test] Returned to Courses page');

    profile.end();
  }
}