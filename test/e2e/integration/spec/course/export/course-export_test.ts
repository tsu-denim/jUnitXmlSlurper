import testUtil = require('../../../../test_util');

describe('Course Export', function() {
  it('should let an instructor export a course PTID=281', testUtil.createTest((create) => {
    var env = create.course()
      .with.instructor()
      .exec();

    testUtil.loginBaseCourses(env.user)
      .openCourse(env.course.id)
      .getOutline()
      .exportWithStudentData()
        .waitForExportToComplete()
        .assertCompletedExportsExist(1)
        .close()
      .openOverflowMenu()
      .openExportPanel()
        .exportWithoutStudentData()
        .waitForExportToComplete()
        .assertCompletedExportsExist(2)
        .deleteFirstExport()
        .close();
  }));
});