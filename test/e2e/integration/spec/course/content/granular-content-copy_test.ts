import controls = require('../../../../controls/index');
import testUtil = require('../../../../test_util');
import config = require('../../../../../../app/config');

if (config.features.contentCopy) {
  describe('Granular content copy', function() {
    it('should let an instructor copy a full Ultra course to an Ultra course PTID=1055', testUtil.createTest((create) => {
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
        .openCopyPanel()
          .checkContentItem(env.courses[1].id)
          .beginCopy()
        .assertContentCopyCompleted()
        .assertContentItemExists(env.externalLinks[0].title)
        .getFolder(env.folders[0].title)
          .expand()
          .assertContentItemExists(env.externalLinks[1].title);
    }));

    it('should let an instructor drill into a course, then navigate out using breadcrumbs PTID=1059', testUtil.createTest((create) => {
      var env = create.course()
        .with.instructor({enrollee: 'instructor'})
        .exec();
      env = create.course()
        .with.instructor({enrollee: 'instructor'})
        .and.folder()
          .with.folder()
            .with.externalLink()
        .exec();

      var course = testUtil.loginBaseCourses(env.user)
        .openCourse(env.courses[0].id);

      course.getOutline()
        .openOverflowMenu()
        .openCopyPanel()
          .selectContentItem(env.courses[1].name)
          .selectContentItem(env.folders[0].title)
          .selectContentItem(env.folders[1].title)
          .assertContentItemIsVisible(env.externalLinks[0].title)
          .openBreadcrumbMenu()
          .selectBreadcrumbMenuItem(env.folders[0].title)
          .assertContentItemIsVisible(env.folders[1].title)
          .openBreadcrumbMenu()
          .selectBreadcrumbMenuItem(env.courses[1].name)
          .assertContentItemIsVisible(env.folders[0].title)
          .openBreadcrumbMenu()
          .selectBreadcrumbMenuRootItem()
          .assertContentItemIsVisible(env.courses[1].name);
    }));

    it('should let an instructor copy multiple contents from multiple courses PTID=1056', testUtil.createTest((create) => {
      var env = create.course()
        .with.instructor({enrollee: 'instructor'})
        .exec();
      env = create.course()
        .with.instructor({enrollee: 'instructor'})
        .and.folder()
          .with.externalLink()
        .and.and.document()
        .and.document()
        .exec();
      env = create.course()
        .with.instructor({enrollee: 'instructor'})
        .and.document()
        .and.folder()
          .with.folder()
            .with.externalLink()
        .and.and.and.folder()
          .with.externalLink()
        .exec();

      var course = testUtil.loginBaseCourses(env.user)
        .openCourse(env.courses[0].id);

      course.getOutline()
        .openOverflowMenu()
        .openCopyPanel()
          .selectContentItem(env.courses[1].name)
          .checkContentItem(env.folders[0].id)
          .checkContentItem(env.documents[0].id)
          .openBreadcrumbMenu()
          .selectBreadcrumbMenuRootItem()
          .selectContentItem(env.courses[2].name)
          .checkContentItem(env.folders[3].id)
          .selectContentItem(env.folders[1].title)
          .selectContentItem(env.folders[2].title)
          .checkContentItem(env.externalLinks[1].id)
          .beginCopy()
        .assertContentCopyCompleted();

      course.getOutline()
        .assertContentItemDoesNotExist(env.documents[1].title)
        .assertContentItemDoesNotExist(env.folders[1].title)
        .assertContentItemDoesNotExist(env.folders[2].title);

      course.getOutline()
        .getFolder(env.folders[0].title)
          .expand()
          .assertContentItemExists(env.externalLinks[0].title);

      course.getOutline()
        .assertContentItemExists(env.documents[0].title)
        .assertContentItemExists(env.externalLinks[1].title)
        .getFolder(env.folders[3].title)
          .expand()
          .assertContentItemExists(env.externalLinks[2].title);
    }));
  });
}
