import controls = require('../../../../controls/index');
import enums = require('../../../../controls/enums/index');
import testUtil = require('../../../../test_util');

describe('the course discussion', function () {

  it('instructor can create discussion (#avalon #shaky) PTID=2', testUtil.createTest((create) => {
    var env = create.course().with.instructor().exec();
    var courseDiscussionsPage = testUtil.loginBaseCourses(env.instructor)
      .openCourse(env.course.id)
      .openDiscussions();

    // create discussion
    var discussionDefaultTitlePartText = 'New Discussion';
    var discussionComment = testUtil.PREFIX + 'comment';
    var panel = courseDiscussionsPage.openCreateDiscussionPanelFromEmptyList();
    panel.setOptions({
      comment: discussionComment
    }).save().closePanel();

    courseDiscussionsPage.assertDiscussionItemExists(discussionDefaultTitlePartText);
  }));

  it('instructor can delete discussion PTID=5', testUtil.createTest((create) => {
    var discussionTitle = testUtil.PREFIX + 'discussion';
    var env = create.course().with.instructor().and.student()
      .and.discussion({from: 'instructor', overrides: {title: discussionTitle, visibility: enums.Visibility.Visible}}).exec();

    // instructor delete the discussion
    var courseDiscussionsPage = testUtil.loginBaseCourses(env.instructor)
      .openCourse(env.course.id)
      .openDiscussions();

    courseDiscussionsPage.getDiscussionItem(discussionTitle).clickDelete();
    courseDiscussionsPage.assertNoDiscussionItemsExist();
  }));

  it('instructor can add comments in discussion PTID=7', testUtil.createTest((create) => {
    var discussionTitle = testUtil.PREFIX + 'discussion';
    var env = create.course().with.instructor().and.student()
      .and.discussion({from: 'instructor', overrides: {title: discussionTitle, visibility: enums.Visibility.Visible}}).exec();

    var courseDiscussionsPage = testUtil.loginBaseCourses(env.instructor)
      .openCourse(env.course.id)
      .openDiscussions();

    // add new comment by instructor
    var discussionComment = testUtil.PREFIX + 'comment';
    var editPanel = courseDiscussionsPage.openEditFirstDiscussionPanel();
    editPanel
      .clearFTUEFilterParticipants()
      .clearFTUESearchParticipants()
      .addComment(discussionComment)
      .saveCommentOrReply();

    editPanel.assertTheNewestComment(discussionComment);
  }));

  it('instructor can view student comments prior to making their own when post first is enabled PTID=822', testUtil.createTest((create) => {
    var discussionTitle = testUtil.PREFIX + 'discussion';
    var discussionStudentComment = testUtil.PREFIX + 'studentcomment';
    var env = create.course().with.instructor().and.student()
      .and.discussion({from: 'instructor', overrides: {title: discussionTitle, visibility: enums.Visibility.Visible, postFirst: true}})
      .with.comment({from: 'student', overrides: {content: discussionStudentComment}}).exec();

    var courseDiscussionsPage = testUtil.loginBaseCourses(env.instructor)
      .openCourse(env.course.id)
      .openDiscussions();

    var editPanel = courseDiscussionsPage.openEditFirstDiscussionPanel();

    //instructor should see existing comment prior to making their own comments
    editPanel.assertTheNewestComment(discussionStudentComment);
    editPanel.assertCommentsCount(1);

  }));

  it('instructor can add replies in discussion PTID=112', testUtil.createTest((create) => {
    var discussionTitle = testUtil.PREFIX + 'discussion';
    var discussionComment = testUtil.PREFIX + 'comment';
    var env = create.course().with.instructor().and.student()
      .and.discussion({from: 'instructor', overrides: {title: discussionTitle, visibility: enums.Visibility.Visible}})
      .with.comment({from: 'instructor', overrides: {content: discussionComment}}).exec();

    var courseDiscussionsPage = testUtil.loginBaseCourses(env.instructor)
      .openCourse(env.course.id)
      .openDiscussions();

    // add new reply by instructor
    var replyComment = testUtil.PREFIX + 'reply';
    var editPanel = courseDiscussionsPage.openEditFirstDiscussionPanel();
    editPanel.addReplyUnderTheNewestComment(replyComment).saveCommentOrReply();
    editPanel.assertReply(replyComment);

    // add third level reply by instructor
    var thirdLevelReply = testUtil.PREFIX + 'third level reply';
    editPanel.addThirdLevelReply(thirdLevelReply).saveCommentOrReply();
    editPanel.assertThirdLevelReply(thirdLevelReply);
  }));

  it('instructor can edit comments/replies in discussion PTID=9', testUtil.createTest((create) => {
    var discussionTitle = testUtil.PREFIX + 'discussion';
    var discussionComment = testUtil.PREFIX + 'comment';
    var env = create.course().with.instructor().and.student()
      .and.discussion({from: 'instructor', overrides: {title: discussionTitle, visibility: enums.Visibility.Visible}})
      .with.comment({from: 'instructor', overrides: {content: discussionComment}}).exec();

    var courseDiscussionsPage = testUtil.loginBaseCourses(env.instructor)
      .openCourse(env.course.id)
      .openDiscussions();
    var editPanel = courseDiscussionsPage.openEditFirstDiscussionPanel();

    // update comment by instructor
    var updatedDiscussionComment = testUtil.PREFIX + 'updated';
    editPanel
      .clearFTUEFilterParticipants()
      .clearFTUESearchParticipants()
      .clickEditFromOverflowMenu()
      .editComment(updatedDiscussionComment)
      .saveCommentOrReply();
    editPanel.assertTheNewestComment(updatedDiscussionComment);
  }));

  it('instructor can delete comments/replies in discussion PTID=10', testUtil.createTest((create) => {
    var discussionTitle = testUtil.PREFIX + 'discussion';
    var discussionComment = testUtil.PREFIX + 'comment';
    var env = create.course().with.instructor().and.student()
      .and.discussion({from: 'instructor', overrides: {title: discussionTitle, visibility: enums.Visibility.Visible}})
      .with.comment({from: 'instructor', overrides: {content: discussionComment}}).exec();

    var courseDiscussionsPage = testUtil.loginBaseCourses(env.instructor)
      .openCourse(env.course.id)
      .openDiscussions();
    var editPanel = courseDiscussionsPage.openEditFirstDiscussionPanel();

    // delete comment by instructor
    editPanel
      .clearFTUEFilterParticipants()
      .clearFTUESearchParticipants()
      .clickDeleteOnFirstComment();
    editPanel.assertDiscussionWithoutAnyComment();
  }));

  it('student can create discussion (#quarantine) PTID=11', testUtil.createTest((create) => {
    var env = create.course().with.instructor().and.student().exec();
    var courseDiscussionsPage = testUtil.loginBaseCourses(env.student)
      .openCourse(env.course.id)
      .openDiscussions()
      .clearFTUEforStudent();

    // create discussion by student
    var discussionDefaultTitlePartText = 'New Discussion';
    var discussionComment = testUtil.PREFIX + 'comment';
    var panel = courseDiscussionsPage.openCreateDiscussionPanelFromEmptyList();
    panel.setOptions({
      comment: discussionComment
    }).save().closePanel();

    courseDiscussionsPage.assertDiscussionItemExists(discussionDefaultTitlePartText);
  }));

  it('student can view instructor\'s comments/replies in discussion PTID=12', testUtil.createTest((create) => {
    var discussionTitle = testUtil.PREFIX + 'discussion';
    var discussionComment = testUtil.PREFIX + 'comment';
    var env = create.course().with.instructor().and.student()
      .and.discussion({from: 'instructor', overrides: {title: discussionTitle, visibility: enums.Visibility.Visible}})
      .with.comment({from: 'instructor', overrides: {content: discussionComment}}).exec();

    // student can see the comment and reply
    var courseDiscussionsPage = testUtil.loginBaseCourses(env.student)
      .openCourse(env.course.id)
      .openDiscussions();
    var editPanel = courseDiscussionsPage.openEditFirstDiscussionPanel();
    editPanel
      .clearFTUEFilterParticipants()
      .clearFTUESearchParticipants()
      .assertTheNewestComment(discussionComment);
  }));

  it('student can add comments in discussion PTID=14', testUtil.createTest((create) => {
    var discussionTitle = testUtil.PREFIX + 'discussion';
    var discussionComment = testUtil.PREFIX + 'comment';
    var env = create.course().with.instructor().and.student()
      .and.discussion({from: 'instructor', overrides: {title: discussionTitle, visibility: enums.Visibility.Visible}}).exec();

    var courseDiscussionsPage = testUtil.loginBaseCourses(env.student)
      .openCourse(env.course.id)
      .openDiscussions();

    var editPanel = courseDiscussionsPage.openEditFirstDiscussionPanel();
    editPanel
      .clearFTUEFilterParticipants()
      .clearFTUESearchParticipants()
      .addComment(discussionComment)
      .saveCommentOrReply();

    editPanel.assertTheNewestComment(discussionComment);
  }));

  it('student should see/not see comments correctly with post first enabled PTID=823', testUtil.createTest((create) => {
    var discussionTitle = testUtil.PREFIX + 'discussion';
    var discussionComment = testUtil.PREFIX + 'comment';
    var discussionStudentComment = testUtil.PREFIX + 'studentcomment';
    var env = create.course().with.instructor().and.student()
      .and.discussion({from: 'instructor', overrides: {title: discussionTitle, visibility: enums.Visibility.Visible, postFirst: true}})
      .with.comment({from: 'instructor', overrides: {content: discussionComment}}).exec();

    var courseDiscussionsPage = testUtil.loginBaseCourses(env.student)
      .openCourse(env.course.id)
      .openDiscussions();

    var editPanel = courseDiscussionsPage.openEditFirstDiscussionPanel();

    //with post first enabled, student should not see existing comments prior to posting
    editPanel
      .clearFTUEFilterParticipants()
      .clearFTUESearchParticipants()
      .assertDiscussionWithoutAnyComment();

    // add new comment by student
    editPanel
      .addComment(discussionStudentComment)
      .saveCommentOrReply();

    //A student should see discussion responses if the post first discussion setting is enabled and they have made a post.
    editPanel.assertCommentsCount(2);
    editPanel.assertTheNewestComment(discussionStudentComment);
  }));

  it('student can add replies in discussion PTID=113', testUtil.createTest((create) => {
    var discussionTitle = testUtil.PREFIX + 'discussion';
    var discussionComment = testUtil.PREFIX + 'comment';
    var env = create.course().with.instructor().and.student()
      .and.discussion({from: 'instructor', overrides: {title: discussionTitle, visibility: enums.Visibility.Visible}})
      .with.comment({from: 'student', overrides: {content: discussionComment}}).exec();

    var courseDiscussionsPage = testUtil.loginBaseCourses(env.student)
      .openCourse(env.course.id)
      .openDiscussions();

    // add new reply by student
    var replyComment = testUtil.PREFIX + 'reply';
    var editPanel = courseDiscussionsPage.openEditFirstDiscussionPanel();
  	editPanel
      .clearFTUEFilterParticipants()
      .clearFTUESearchParticipants()
      .addReplyUnderTheNewestComment(replyComment)
      .saveCommentOrReply();

	  editPanel.assertReply(replyComment);

    // add third level reply by student
    var thirdLevelReply = testUtil.PREFIX + 'third level reply';
    editPanel.addThirdLevelReply(thirdLevelReply).saveCommentOrReply();
    editPanel.assertThirdLevelReply(thirdLevelReply);
  }));

  it('student can edit his/her own comments/replies in discussion PTID=15', testUtil.createTest((create) => {
    var discussionTitle = testUtil.PREFIX + 'discussion';
    var discussionComment = testUtil.PREFIX + 'comment';
    var env = create.course().with.instructor().and.student()
      .and.discussion({from: 'instructor', overrides: {title: discussionTitle, visibility: enums.Visibility.Visible}})
      .with.comment({from: 'student', overrides: {content: discussionComment}}).exec();

    var courseDiscussionsPage = testUtil.loginBaseCourses(env.student)
      .openCourse(env.course.id)
      .openDiscussions();
    var editPanel = courseDiscussionsPage.openEditFirstDiscussionPanel();

    // update comment by student
    var updatedDiscussionComment = testUtil.PREFIX + 'updated';
    editPanel.clickEditFromOverflowMenu().editComment(updatedDiscussionComment).saveCommentOrReply();
    editPanel.assertTheNewestComment(updatedDiscussionComment);
  }));

  it('student can delete his/her own comments/replies in discussion PTID=16', testUtil.createTest((create) => {
    var discussionTitle = testUtil.PREFIX + 'discussion';
    var discussionComment = testUtil.PREFIX + 'comment';
    var env = create.course().with.instructor().and.student()
      .and.discussion({from: 'instructor', overrides: {title: discussionTitle, visibility: enums.Visibility.Visible}})
      .with.comment({from: 'student', overrides: {content: discussionComment}}).exec();

    var courseDiscussionsPage = testUtil.loginBaseCourses(env.student)
      .openCourse(env.course.id)
      .openDiscussions();
    var editPanel = courseDiscussionsPage.openEditFirstDiscussionPanel();

    // delete comment by student
    editPanel
      .clearFTUEFilterParticipants()
      .clearFTUESearchParticipants()
      .clickDeleteOnFirstComment();
    editPanel.assertDiscussionWithoutAnyComment();
  }));
});
