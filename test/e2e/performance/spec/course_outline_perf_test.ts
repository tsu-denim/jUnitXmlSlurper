import ab = require('asyncblock');
import controls = require('../../controls/index');
import enums = require('../../controls/enums/index');
import testUtil = require('../../test_util');
import dataSet = require('../data-set-generator');

import {IEnvironment} from '../../test_data/create_base';
import {TestProfiler, IProfiler, TestWorkflow} from '../test-profiler';

import * as InstructorVisitDocuments from '../workflow/instructor/course_outline_documents';
import * as InstructorVisitRoster from '../workflow/instructor/course_outline_roster';

export const FOLDER_SUB_CONTENT = 10;
export const FOLDER = 10;
export const OPENFILETIME = 10;

// TODO: export the following class and move to "../workflow/instructor" as long as its relevant TODO is done
class InstructorVisitFolders extends TestWorkflow {
  execute(basePage: controls.BasePage.Control, profile: IProfiler) {
    profile.start();

    let courseList = basePage.openCourses();
    let courseOutline = courseList.openCourse(this.env.course.id).getOutline();
    profile.record('[Memory Leak Test] Opened Courses page');

    for (let i = 1; i <= OPENFILETIME; i++) {
      courseOutline.getFolder(`folderName_${i}`).expand();
      profile.record(`opened the folder ${i}`);

      courseOutline.scrollToLastFolderContentItem();
      profile.record('Scrolled to last folder content item');

      var dragDocumentName = 'sub_document_' + Math.floor(OPENFILETIME / 2);
      courseOutline.moveItemDown(dragDocumentName);
      profile.record('moved document down');

      courseOutline.moveItemUp(dragDocumentName);
      profile.record('moved document up');

      courseOutline.getFolder(`folderName_${i}`).collapse();
      profile.record(`closed the folder ${i}`);
    }

    courseOutline.closePanel();
    profile.record('[Memory Leak Test] Returned to Courses page');

    profile.end();
  }
}

describe('Course Outline Suite', function() {
  let env: IEnvironment;

  beforeAll(dataSet.build((globalEnv) => {
    env = globalEnv;
  }));

  it('Instructor reviews course content(Document)', testUtil.createTest(() => {
    new InstructorVisitDocuments.Workflow(env).execute(testUtil.loginBase(env[dataSet.INSTRUCTOR]), new TestProfiler('Course Outline Suite', 'Instructor reviews course content'));
  }));

  it('Instructor views roster', testUtil.createTest(() => {
    new InstructorVisitRoster.Workflow(env).execute(testUtil.loginBase(env[dataSet.INSTRUCTOR]), new TestProfiler('Course Outline Suite', 'Instructor views roster'));
  }));

  it('Instructor reviews course content(Folder)', testUtil.createTest((create) => {
    // TODO: any data preparation should be included in data-set-generator so that all of specs can run based on the same env
    let course = create.course();
    let env = course.with.instructor().exec();
    var folder;
    // create folder in Course_A
    for (let i = 1; i <= FOLDER; i++) {
      folder = course.folder({overrides: {title: `folderName_${i}`}}).exec();

      // Create sub documents in folder
      for (let j = 1; j <= FOLDER_SUB_CONTENT; j++) {
        course.document({overrides: {title: `sub_document_${j}`},  parentId: folder.folders[i - 1].id}).exec();
      }
    }

    new InstructorVisitFolders(env).execute(testUtil.loginBase(env[dataSet.INSTRUCTOR]), new TestProfiler('Course Outline Suite', 'Instructor reviews course content(Folder)'));
  }));

});