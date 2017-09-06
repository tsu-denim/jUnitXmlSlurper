import controls = require('../../../controls/index');
import testUtil = require('../../../test_util');

describe('Accommodation feature', function() {

  function getLateDate(now: Date) {
    return new Date(now.getFullYear(), now.getMonth(), now.getDate(), now.getHours(), now.getMinutes() - 5);
  }

  it('allows Instructor to set accommodation flag and see "late" indicators correctly PTID=423', testUtil.createTest((create) => {
    var env = create.course().with.instructor().and.students().and.assignment({overrides: {assignment: {gradingColumn: {dueDate: getLateDate(new Date())}}}})
      .with.submission({ from: 'student_1'}).and.submission({ from: 'student_2'})
      .with.grade({ from: 'instructor'})
      .exec();

    var studentName = env.student_1.givenName + ' ' + env.student_1.familyName;

    // Roster
    var coursePage = testUtil.loginBaseCourses(env.instructor)
      .openCourse(env.course.id);
    var courseRosterPage = coursePage.openRoster().switchToListView();
    courseRosterPage
      .openAccommodationPanel(studentName)
      .setDueDateAccommodation(true)
      .save();
    courseRosterPage
      .assertDueDateAccommodationLink(studentName)
      .close();

    // Submissions
    coursePage
      .openOutline()
      .getContentItem(env.assignment.title)
      .openAsAssignmentAsEditor()
      .assertAccommodationsCount(1)
      .openSubmissionsPanel()
      .clearFTUEWithUngradedItem()
      .assertSubmissisonLate(env.student_1.id, false)
      .assertSubmissisonLate(env.student_2.id, true);
  }));

  it('allows Student with due date exception to see "late" indicators correctly PTID=424', testUtil.createTest((create) => {
    var env = create.course()
      .with.instructor().and.student({enrollmentOverrides: {dueDateExceptionType: 'Unlimited'}})
      .and.assignment({overrides: {assignment: {gradingColumn: {dueDate: getLateDate(new Date())}}}})
      .exec();

    testUtil
      .loginBaseCourses(env.student)
      .openCourse(env.course.id)
      .getOutline()
      .getContentItem(env.assignment.title)
      .openAssessmentAsViewer()
      .assertNoLateIndicator()
      .startAttempt()
      .assertNoLateIndicator()
      .submit()
      .assertGradeNoLateIndicator();
  }));
});