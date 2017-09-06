import controls = require('../../index');
import testUtil = require('../../../test_util');
import {ElementFinderSync, browserSync, elementSync, polledExpect, waitFor} from 'protractor-sync';

export class Control {
  rootElement: ElementFinderSync;

  constructor(rootElement?: ElementFinderSync) {
    if (this.constructor === Control) {
      return testUtil.instantiateBreakpointClass([Small, Medium, Large], rootElement);
    } else {
      this.rootElement = rootElement || elementSync.findVisible('#panel-export');
    }
  }

  close() {
    this.rootElement.closest('.bb-offcanvas-panel-wrap').findVisible('.bb-close').click().waitUntilRemoved();

    return new controls.CourseOutlinePage.Control();
  }

  exportWithoutStudentData() {
    this.rootElement.findVisible('#add-export-package').click();
    elementSync.findVisible('.reveal-modal .js-export-without-student-data').click();

    return this;
  }

  // Verifies the correct number of completed export tasks are shown
  assertCompletedExportsExist(exportCount: number) {
    var completedExports = this.rootElement.findVisibles('.list-archive-export .completed');
    polledExpect(() => { return completedExports.length; }).toBe(exportCount);

    return this;
  }

  deleteFirstExport() {
    var completedExport = this.rootElement.findVisibles('.list-archive-export .completed')[0];
    completedExport.findVisible('.js-delete-archive').click();

    elementSync.findVisible('.reveal-modal .confirm-ok').click();

    completedExport.waitUntilRemoved();
    return this;
  }

  waitForExportToComplete() {
    var inProgressIndicator = this.rootElement.findVisible('.in-progress');
    testUtil.runSystemTaskNow(inProgressIndicator.getAttribute('task-id'));

    waitFor(() => {
      try {
        inProgressIndicator.waitUntilRemoved();
        return true;
      } catch (err) {
        // Ignore that the implicit wait timed out
      }
      return false;
    }, 60000);

    return this;
  }
}

class Small extends Control {

}

class Medium extends Control {

}

class Large extends Control {

}
