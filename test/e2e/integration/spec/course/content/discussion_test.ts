import testUtil = require('../../../../test_util');

describe('A discussion', function() {
  it('can be created successfully on course outline by an instructor PTID=248', testUtil.createTest((create) => {
    var env = create.course().with.instructor().exec();
    var courseOutlinePage = testUtil.loginBase(env.user)
      .openCourses()
      .openCourse(env.course.id)
      .getOutline();

    var discussionTitle = testUtil.PREFIX + 'top_discussion_title';
    var discussionComment = testUtil.PREFIX + 'top_discussion_comment';

    courseOutlinePage.addDiscussionToEmptyOutline({
      title: discussionTitle,
      comment: discussionComment
    });

    courseOutlinePage.assertContentItemExists(discussionTitle);
    courseOutlinePage.getContentItem(discussionTitle)
      .assertDescription(discussionComment);
  }));
});