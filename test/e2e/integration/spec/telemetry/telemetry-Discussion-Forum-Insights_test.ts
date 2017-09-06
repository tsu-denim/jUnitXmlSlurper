import enums = require('../../../controls/enums/index');
import testUtil = require('../../../test_util');

describe('A discussion forum insight panel', function() {
  it('will open and allow a users to select the top comment to view a discussion panel PTID=662', testUtil.createTest((create) => {
      let discussionTitle = testUtil.PREFIX + 'graded_discussion';
      let feedbackText = 'good job you all';
      let discussionWithPostedGrade = create.course().with.student().and.instructor()
        .and.discussion({from: 'instructor', overrides: {title: discussionTitle, visibility: enums.Visibility.Visible}})
        .with.enableGradedDiscussion({from: 'instructor'})
        .with.comment({from: 'student'})
        .with.gradeStudentInGradedDiscussion({
          feedbackToUser: {rawText: feedbackText}
        })
        .with.postGradeForStudentInGradedDiscussion();
      let env = discussionWithPostedGrade.exec();

      let dfiPanel = testUtil.loginBaseCourses(env.instructor)
        .openCourse(env.course.id)
        .openDiscussions()
        .getDiscussionItem(discussionTitle)
        .openInsightsPanel();

      let discussionPanel = dfiPanel.clickTopCommentToOpenDiscussion();
      discussionPanel.assertCommentsCount(1);
    }
  ));
});