import controls = require('../../../../controls/index');
import testUtil = require('../../../../test_util');

describe('Drag and drop', function () {
  it('can reposition content with keyboard PTID=301', testUtil.createTest((create) => {
    var course = create.course();
    var env = course.with.instructor()
      .and.externalLink({overrides: {positionBefore: 'start'}}).exec();
    env = course.with.externalLink({overrides: {positionAfter: env.externalLink.id}}).exec();

    var courseOutlinePage = testUtil.loginBaseCourses(env.user)
      .openCourse(env.course.id)
      .getOutline();

    var contentItem = courseOutlinePage.startDrag(env.externalLinks[0].title);
    courseOutlinePage.assertPlaceholderShown();
    contentItem.dragDown() //drag below link
      .drop();

    courseOutlinePage.assertContentBeforeAnother(env.externalLinks[1].title, env.externalLinks[0].title);

    courseOutlinePage.startDrag(env.externalLinks[0].title)
      .dragUp() //drag between both links
      .dragUp() //drag above first link
      .drop();

    courseOutlinePage.assertContentBeforeAnother(env.externalLinks[0].title, env.externalLinks[1].title);
  }));

  it('can move content into a folder with other content PTID=302', testUtil.createTest((create) => {
    var course = create.course();
    var env = course.with.instructor()
      .and.externalLink({overrides: {positionBefore: 'start'}}).exec();
    env = course.with.folder({overrides: {positionAfter: env.externalLink.id}})
      .with.externalLink({overrides: {positionBefore: 'start'}}).exec();

    var courseOutlinePage = testUtil.loginBaseCourses(env.user)
      .openCourse(env.course.id)
      .getOutline();

    courseOutlinePage.startDrag(env.externalLinks[0].title)
      .dragDown() //highlight folder
      .openFolderDuringKeyboardDrag()
      .dragDown() //drag into folder
      .dragDown() //drag below link inside folder
      .drop();

    courseOutlinePage.getFolder(env.folder.title).assertContentItemExists(env.externalLinks[0].title).collapse();
    courseOutlinePage.assertContentItemDoesNotExist(env.externalLinks[0].title);
  }));

  it('prevents dropping into a nested folder while a folder is being dragged PTID=303', testUtil.createTest((create) => {
    var course = create.course();
    var env = course.with.instructor()
      .and.folder({overrides: {positionBefore: 'start'}}).exec();
    env = course.with.folder({overrides: {positionAfter: env.folder.id}})
      .with.folder({overrides: {positionBefore: 'start'}}).exec();

    var courseOutlinePage = testUtil.loginBaseCourses(env.user)
      .openCourse(env.course.id)
      .getOutline();

    courseOutlinePage.getFolder(env.folders[1].title).expand().getFolder(env.folders[2].title).expand();

    courseOutlinePage.startDrag(env.folders[0].title)
      .dragDown() //highlights folder
      .dragDown() //move placeholder into folder
      .dragDown(); //move placeholder down in folder
    
    courseOutlinePage.assertPlaceholderShown();
    courseOutlinePage.getFolder(env.folders[2].title).assertNoPlaceholderShown();
  }));
});
