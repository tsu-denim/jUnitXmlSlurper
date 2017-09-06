import controls = require('../../../../controls/index');
import testUtil = require('../../../../test_util');
import config = require('../../../../../../app/config');

describe('Course Import', function() {
  it('should let an instructor import a classic course export into an Ultra course PTID=282', testUtil.createTest((create) => {
    var exportFilePath = testUtil.pathFromUltraUIRoot(
      'node_modules/learn-import-packages/ClassicWithOutStudentData/ExportFile_ClassicCourse_20150820065011.zip'
    );

    var env = create.course()
      .with.instructor()
      .exec();

    var course = testUtil.loginBaseCourses(env.user)
      .openCourse(env.course.id);

    openImportPanelFromCourseOutlineAndImportFile(exportFilePath, course);

    course.openCopyImportReportPanel()
      .close()
      .closeCopyImportNotification();
  }));

  it('should let an instructor import an Ultra course export into an Ultra course PTID=283', testUtil.createTest((create) => {
    var exportFilePath = testUtil.pathFromUltraUIRoot(
      'node_modules/learn-import-packages/UltraWithOutStudentData/ExportFile_uwosd_20150820022422.zip'
    );

    var env = create.course()
      .with.instructor()
      .exec();

    var course = testUtil.loginBaseCourses(env.user)
      .openCourse(env.course.id);

    openImportPanelFromCourseOutlineAndImportFile(exportFilePath, course);

    course.closeCopyImportNotification();
  }));

  function openImportPanelFromCourseOutlineAndImportFile(exportFilePath: string, course: any) {
    if (config.features.contentCopy) {
      course.getOutline()
        .openOverflowMenu()
        .openImportContentPanel()
          .uploadAndImportPackage(exportFilePath)
        .assertCopyOrImportCompleted();
    } else {
      course.getOutline()
        .openOverflowMenu()
        .openImportPanel()
          .uploadAndImportPackage(exportFilePath)
        .assertCopyOrImportCompleted();
    }
  }
});