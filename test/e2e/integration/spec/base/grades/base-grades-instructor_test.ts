import controls = require('../../../../controls/index');
import enums = require('../../../../controls/enums/index');
import testUtil = require('../../../../test_util');

describe('The base grades page (as instructor)', () => {
  it('should display correct column summary status for grade columns (#avalon #shaky) PTID=522', testUtil.createTest((create) => {
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

    //Log in as instructor and check the column summary status of gradable columns on base grade
    var courseCard = testUtil.loginBaseGrades(env.instructor)
      .getInstructorCourseCard(env.course.name)
      .clearFTUE();

    //Show "Nothing to grade" for graded discussion without participation
    courseCard.getColumn(env.discussion.title)
      .assertGradeProgress(enums.ColumnSummaryStatus.NothingToGrade);

    //Show "1 to grade" for offline item without grade
    courseCard.getColumn(env.offlineItem.columnName)
      .assertGradeProgress(enums.ColumnSummaryStatus.NeedsGrading);

    //Show "1 to post" for test with non-Posted grade and "All graded" if grade posted
    courseCard.getColumn(env.test.title)
      .assertGradeProgress(enums.ColumnSummaryStatus.NeedsPosting)
      .postGrades()
      .assertGradeProgress(enums.ColumnSummaryStatus.AllGraded);
  }));

  // ULTRA-23433 Expected 'NoSuchWindowError: no such window: target window already closed from unknown error: web view not found
  it('should open course grade from base grade and open Submission/Grades panel when click on grade columns (#quarantine) PTID=523', testUtil.createTest((create) => {
    //Instructors create assignment and offline item
    var env = create.course()
      .with.instructor()
      .and.with.student()
      .and.offlineItem()
      .and.assignment()
      .exec();

    //Log in as instructor and open base grade
    var courseCard = testUtil.loginBaseGrades(env.instructor)
      .getInstructorCourseCard(env.course.name)
      .clearFTUE();

    //Instructor can open course grade from base grade
    courseCard.openCourse(env.course.name)
      .assertListViewIsOpen()
      .clearFTUE()
      .closePanel();

    //Instructor can open Submissions/Grades panel when click assignment/offline item from base grade
    courseCard.openSubmissionsByGradeColumnTitle(env.assignment.title)
      .closePanel();

    courseCard.openSubmissionsByGradeColumnTitle(env.offlineItem.columnName)
      .closePanel();
  }));

});