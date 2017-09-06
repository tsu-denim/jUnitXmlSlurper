import controls = require('../../../../controls/index');
import testUtil = require('../../../../test_util');

describe('The course calendar page for a student who is enrolled in a course', () => {

  var startDate: Date;
  var endDate: Date;

  beforeAll(() => {
    var date = new Date();
    startDate = new Date(date.getFullYear(), date.getMonth(), date.getDate(), 0, 0);
    endDate = new Date(date.getFullYear(), date.getMonth(), date.getDate(), date.getHours() + 1, date.getMinutes());
  });

  it('should view an existing event (#defer) PTID=384', testUtil.createTest((create) => {
    var title = testUtil.PREFIX + 'calendar';
    var env = create.course().with.student().and.calendarItem({overrides: {title: title, startDate: startDate, endDate: endDate}}).exec();
    var courseCalendarPage = testUtil.loginBaseCourses(env.student)
      .openCourse(env.course.id)
      .openCalendar();
    courseCalendarPage.assertCalendarItemExists(title);
  }));

  it('should view event for current day PTID=384', testUtil.createTest((create) => {
    var title = testUtil.PREFIX + 'calendar';
    var env = create.course().with.student().and.calendarItem({overrides: {title: title, startDate: startDate, endDate: endDate}}).exec();
    var courseCalendarPage = testUtil.loginBaseCourses(env.student)
      .openCourse(env.course.id)
      .openCalendar();

    courseCalendarPage.goToPreviousWeek();
    courseCalendarPage.assertCalendarItemDoesNotExist(title);

    courseCalendarPage.goToToday();
    courseCalendarPage.assertCalendarItemExists(title);
  }));

  it('should view events in Month View (#defer) PTID=384', testUtil.createTest((create) => {
    var title1 = testUtil.PREFIX + 'calendar1';
    var title2 = testUtil.PREFIX + 'calendar2';
    var date = new Date();
    var startDate = new Date(date.getFullYear(), date.getMonth(), date.getDate(), 0);
    var endDate = new Date(date.getFullYear(), date.getMonth(), date.getDate(), 22);
    // add two events
    var env = create.course().with.student().and.calendarItem({overrides: {title: title1, startDate: startDate, endDate: endDate}}).and
      .calendarItem({overrides: {title: title2, startDate: startDate, endDate: endDate}}).exec();
    var courseCalendarPage = testUtil.loginBaseCourses(env.student)
      .openCourse(env.course.id)
      .openCalendar();

    courseCalendarPage.goToMonthView();
    courseCalendarPage.assertCalendarItemExistsInMonth(title1);
    courseCalendarPage.assertCalendarItemExistsInMonth(title2);
  }));

  it('should view assignment items in Due Dates PTID=381', testUtil.createTest((create) => {
    var dueDate = new Date();
    // One day later
    var dueDateOneDayLater = new Date(dueDate.getFullYear(), dueDate.getMonth(), dueDate.getDate() + 1);
    // Three days later
    var dueDateThreeDaysLater = new Date(dueDate.getFullYear(), dueDate.getMonth(), dueDate.getDate() + 3);
    // One Week later
    var dueDateOneWeekLater = new Date(dueDate.getFullYear(), dueDate.getMonth(), dueDate.getDate() + 7);

    var env =
      create
        .course().with
        .instructor()
        .and.student()
        .and.assignment({overrides: {assignment: {gradingColumn: {dueDate: dueDateOneDayLater}}}})
        .and.assignment({overrides: {assignment: {gradingColumn: {dueDate: dueDateThreeDaysLater}}}})
        .and.assignment({overrides: {assignment: {gradingColumn: {dueDate: dueDateOneWeekLater}}}})
        .exec();

    var courseCalendarPage = testUtil.loginBaseCourses(env.student)
      .openCourse(env.course.id)
      .openCalendar();

    courseCalendarPage.goToDueDates();
    var assignments = env.assignments;

    assignments.forEach((assignment: any) => {
      courseCalendarPage.assertAssignmentExists(assignment.title);
    });
  }));

});