import controls = require('../../../../controls/index');
import enums = require('../../../../controls/enums/index');
import testUtil = require('../../../../test_util');

describe('A folder', function () {

  it('can be expanded/ collapsed PTID=246', testUtil.createTest((create) => {
    var env = create.course()
      .with.instructor()
      .and.folder()
        .with.folder()
          .with.externalLink()
      .exec();

    var parentFolder = testUtil.loginBaseCourses(env.user)
      .openCourse(env.course.id)
      .getOutline()
      .getFolder(env.folder.title);

    parentFolder.assertContentItemDoesNotExist(env.folders[1].title)
      .expand()
      .assertContentItemExists(env.folders[1].title)
      .getFolder(env.folders[1].title)
        .expand()
        .assertContentItemExists(env.externalLink.title)
        .collapse()
        .assertContentItemDoesNotExist(env.externalLink.title);

    parentFolder.collapse()
      .assertContentItemDoesNotExist(env.folders[1].title);
  }));
});
