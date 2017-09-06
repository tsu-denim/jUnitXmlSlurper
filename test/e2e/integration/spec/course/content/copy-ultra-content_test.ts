import controls = require('../../../../controls/index');
import testUtil = require('../../../../test_util');
import config = require('../../../../../../app/config');

if (!config.features.contentCopy) {
  describe('Course Copy', function() {
    // Import sometimes fails due to LRN-124186
    it('should let an instructor copy all contents from a classic course to an Ultra course (#quarantine) PTID=285', testUtil.createTest((create) => {
      var archiveFilePath = testUtil.pathFromUltraUIRoot(
        'node_modules/learn-import-packages/ClassicWithOutStudentData/ArchiveFile_ClassicCourse_20150820065019.zip'
      );

      var env = create.course()
          .with.instructor({enrollee: 'user'})
          .exec();
      env = create.course({overrides: {ultraStatus: 'CLASSIC'}})
          .with.instructor({enrollee: 'user'})
          .and.contentExchangeImport({packagePath: archiveFilePath})
          .exec();

      var course = testUtil.loginBaseCourses(env.user)
        .openCourse(env.course.id);

      course.getOutline()
        .openOverflowMenu()
        .openImportPanel()
          .copyAllContentsFromCourse(env.courses[1].courseId)
        .assertCopyOrImportCompleted()
        .getFolder('Content')
          .expand()
          .assertHasContentItems();

      course.openCopyImportReportPanel()
        .close()
        .closeCopyImportNotification();
    }));

    it('should let an instructor copy all contents from a course to an Ultra course PTID=284', testUtil.createTest((create) => {
      var env = create.course()
            .with.instructor({enrollee: 'instructor'})
            .exec();
      env = create.course()
            .with.instructor({enrollee: 'instructor'})
            .and.externalLink()
            .and.folder()
              .with.externalLink()
        .exec();

      var course = testUtil.loginBaseCourses(env.user)
        .openCourse(env.courses[0].id);

      course.getOutline()
        .openOverflowMenu()
        .openImportPanel()
          .copyAllContentsFromCourse(env.courses[1].courseId)
        .assertCopyOrImportCompleted()
        .assertContentItemExists(env.externalLinks[0].title)
        .getFolder(env.folders[0].title)
          .expand()
          .assertContentItemExists(env.externalLinks[1].title);

      course.closeCopyImportNotification();
    }));
  });
}