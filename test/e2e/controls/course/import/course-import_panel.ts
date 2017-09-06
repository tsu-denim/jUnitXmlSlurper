import controls = require('../../index');
import testUtil = require('../../../test_util');
import {By, ElementFinderSync, browserSync, elementSync, polledExpect, waitFor} from 'protractor-sync';

export class Control {
  rootElement: ElementFinderSync;

  constructor(rootElement?: ElementFinderSync) {
    if (this.constructor === Control) {
      return testUtil.instantiateBreakpointClass([Small, Medium, Large], rootElement);
    } else {
      this.rootElement = rootElement || elementSync.findVisible('.panel-copy-import').closest('.bb-offcanvas-panel-wrap');
    }
  }

  close() {
    this.rootElement.findVisible('.bb-close').click().waitUntilRemoved();
    return new controls.CourseOutlinePage.Control();
  }

  copy() {
    this.rootElement.findVisible('.js-start-course-copy').click().waitUntilRemoved();

    return new controls.CourseOutlinePage.Control();
  }

  copyAllContentsFromCourse(courseName: string) {
    if (testUtil.features.contentCopy) {
      this.rootElement.findVisible(By.partialLinkText(courseName)).click();
      this.rootElement.findVisible('.js-import-all').click().waitUntilRemoved();
    } else {
      this.rootElement.findVisible(By.partialLinkText(courseName)).click().waitUntilRemoved();
    }

    return new controls.CourseOutlinePage.Control();
  }

  uploadAndImportPackage(packagePath: string) {
    this.rootElement.findVisibles('.file-upload-container')[0].findElement('.fileUploadInput').sendKeys(packagePath);

    //poll a little longer while we wait for the package to upload and the panel to close.
    waitFor(() => {
      try {
        this.rootElement.waitUntilRemoved();
        return true;
      } catch (err) {
        // Ignore that the implicit wait timed out
      }
      return false;
    }, 60000);

    return new controls.CourseOutlinePage.Control();
  }
}

class Small extends Control {

}

class Medium extends Control {

}

class Large extends Control {

}