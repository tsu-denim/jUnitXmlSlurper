import controls = require('../../../../controls/index');
import enums = require('../../../../controls/enums/index');
import testUtil = require('../../../../test_util');

describe('A file', function () {
  it('can be uploaded as content to the outline PTID=247', testUtil.createTest((create) => {
    var env = create.course().with.instructor().exec();
    testUtil.loginBaseCourses(env.user)
      .openCourse(env.course.id)
      .getOutline()
      .uploadFileToEmptyOutline('test.txt')
      .assertContentItemExists('test.txt')
      .uploadFileToOutline('sample.png')
      .assertContentItemExists('sample.png');
  }));

  it('can be uploaded inside the BbML editor in documents PTID=499', testUtil.createTest((create) => {
    var env = create.course().with.instructor().and.document().exec();

    var document = testUtil.loginBaseCourses(env.user)
      .openCourse(env.course.id)
      .getOutline()
      .clearInstructorFTUE()
      .getContentItem(env.document.title)
      .openAsDocument();

    var editor = document.bbmlEditor;

    editor.uploadFileInlineToEmptyEditor('sample.png', false)
      .assertFileLinkInTempStorage() //If a file is uploaded in the first save then the server doesn't change the link to the permanent location until the second save
      .clickSave();

    //TODO: We currently can't upload images since it relies on opening the file browser to set the type
    // editor.uploadFileInlineToExistingEditor('sample.png', true, 0)
    //   .assertFileDisplayedAsImage()
    //   .assertFileLinkInPermanentStorage()
    //   .clickSave();

    editor.uploadFileAndCancelToNewEditor('test.txt', false, 1)
      .assertText(''); //text should be blank if we cancelled the link
  }));
});
