import controls = require('../../../../controls/index');
import enums = require('../../../../controls/enums/index');
import testUtil = require('../../../../test_util');

describe('The course grades page (as instructor)', () => {

  it('should display correct column summary status for list view PTID=528', testUtil.createTest((create) => {
    // Instructor creates assessment with grade, graded discussion and offline item
    var testWithQuestion = create.course()
      .with.instructor()
      .and.students(2)
      .and.offlineItem()
      .and.discussion({
        from: 'instructor',
        overrides: { visibility: enums.Visibility.Visible }
      }).with.enableGradedDiscussion({ from: 'instructor' })
      .and.test().with.question({ questionType: enums.QuestionType.Essay });

    var env = testWithQuestion.exec();
    testWithQuestion.and.submission({ from: 'student_1' })
      .grade({ from: 'instructor', postGrade: false }).exec();

    //Log in as instructor and open course grade to show list view by default
    var gradeListView = testUtil.loginBaseCourses(env.instructor)
      .openCourse(env.course.id)
      .openGradesAsGrader()
      .clearFTUE()
      .assertListViewIsOpen();

    //Instructor checks the column summary status of gradable columns on course grade list view
    //Show "Nothing to grade" for graded discussion without participation
    gradeListView.getColumn(env.discussion.title)
      .assertGradeProgress(enums.ColumnSummaryStatus.NothingToGrade);

    //Show "2 to grade" for offline item without grade
    gradeListView.getColumn(env.offlineItem.columnName)
      .assertGradeProgress(enums.ColumnSummaryStatus.NeedsGrading);

    //Show "1 to post" for test with non-Posted grade and "All graded" if grade posted
    gradeListView.getColumn(env.test.title)
      .assertGradeProgress(enums.ColumnSummaryStatus.NeedsPosting)
      .postGrades()
      .assertGradeProgress(enums.ColumnSummaryStatus.AllGraded);

  }));

  it('should open Submissions panel for assessment and Participation & Grades panel for graded discussion PTID=529', testUtil.createTest((create) => {
    // Instructor creates assessment and graded discussion
    var env = create.course()
      .with.instructor().and.student()
      .and.test().with.question({ questionType: enums.QuestionType.Essay })
      .and.and.discussion({
        from: 'instructor',
        overrides: { visibility: enums.Visibility.Visible }
      }).with.enableGradedDiscussion({ from: 'instructor' })
      .exec();

    //Log in as instructor and open course grade
    var gradeListView = testUtil.loginBaseCourses(env.instructor)
      .openCourse(env.course.id)
      .openGradesAsGrader()
      .clearFTUE();

    //Instructor can open Submissions panel for assessment
    gradeListView
      .openSubmissionsByContentItemTitle(env.test.title)
      .closePanel();

    //Instructor can open Participation & Grades panel for graded discussion
    gradeListView
      .openParticipationAndGradePanelByTitle(env.discussion.title)
      .closePanel();
  }));

  //ULTRA-22433 Quarantined 2E Test Intermittent Failure
  it('should allow manual grade and feedback to be entered and posted for an offline item (#quarantine) PTID=530', testUtil.createTest((create) => {
    //Instructor creates offline item
    var env = create.course().with.instructor().and.student().and.offlineItem().exec();

    //Log in as instructor and open course grade
    var gradeListView = testUtil.loginBaseCourses(env.instructor)
      .openCourse(env.course.id)
      .openGradesAsGrader()
      .clearFTUE();

    //Instructor can post grade with comment
    gradeListView
      .openNonAttemptGradeItemByName(env.offlineItem.columnName)
      .clearFTUE()
      .enterGrade({ studentId: env.student.id, grade: '80' })
      .postGrade(env.student.id)
      .addFeedback({ studentId: env.student.id, feedback: 'feedback' });
  }));

  it('can create offline item and delete grade items from list view PTID=531', testUtil.createTest((create) => {
    //Instructor creates test
    var env = create.course().with.instructor().and.student().and.test().exec();

    //Log in as instructor and open course grade
    var gradeListView = testUtil.loginBaseCourses(env.instructor)
      .openCourse(env.course.id)
      .openGradesAsGrader()
      .clearFTUE();

    //Instructor can add new offline item
    var offlineItemTitle = 'offlineItem';

    gradeListView.addOfflineItem()
      .setItemName(offlineItemTitle)
      .setMaximumScore('100')
      .save();
    gradeListView.assertColumnExists(offlineItemTitle);

    //Instructor can delete grade items from course grade list view
    gradeListView.getColumn(offlineItemTitle)
      .deleteColumn();
    gradeListView.assertColumnDoesNotExist(offlineItemTitle);
  }));

});