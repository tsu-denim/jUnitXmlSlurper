import controls = require('../../../../controls/index');
import testUtil = require('../../../../test_util');

describe('The calendar page for a student who is enrolled in a course', () => {

  it('should add an personal event PTID=382', testUtil.createTest((create) => {
    var env = create.course().with.student().exec();
    var calendarPage = testUtil.loginBaseCalendar(env.student);

    // Add a personal event
    var title = testUtil.PREFIX + 'calendar';
    calendarPage.addCalendarItemForUserOrStudent({title: title});
    calendarPage.assertCalendarItemExists(title);
  }));

  it('should edit an personal event PTID=389', testUtil.createTest((create) => {
    var title = testUtil.PREFIX + 'calendar';
    var env = create.course().with.student().with.calendarItem({overrides: {title: title}}).exec();
    var calendarPage = testUtil.loginBaseCalendar(env.student);

    // Edit the personal event
    var updatedTitle = title + '_updated';
    calendarPage.editCalendarItem(title, {title: updatedTitle});
    calendarPage.assertCalendarItemExists(updatedTitle);
  }));

  it('should display an existing event from the course calendar (#defer) PTID=383', testUtil.createTest((create) => {
    var title = testUtil.PREFIX + 'calendar';
    var env = create.course().with.student().and.calendarItem({overrides: {title: title}}).exec();
    var calendarPage = testUtil.loginBaseCalendar(env.student);
    calendarPage.assertCalendarItemExists(title);
  }));

  it('should delete an existing personal event PTID=390', testUtil.createTest((create) => {
    var title = testUtil.PREFIX + 'calendar';
    var env = create.course().with.student().with.calendarItem({overrides: {title: title}}).exec();
    var calendarPage = testUtil.loginBaseCalendar(env.student);
    // Remove the personal event
    calendarPage.removeCalendarItem(title);
    calendarPage.assertCalendarItemDoesNotExist(title);
  }));

  it('should view event for current day PTID=383', testUtil.createTest((create) => {
    var title = testUtil.PREFIX + 'calendar';
    var env = create.course().with.student().and.calendarItem({overrides: {title: title}}).exec();

    var calendarPage = testUtil.loginBaseCalendar(env.student);

    calendarPage.goToPreviousWeek();
    calendarPage.assertCalendarItemDoesNotExist(title);

    calendarPage.goToToday();
    calendarPage.assertCalendarItemExists(title);
  }));

  it('should view events in Month View (#defer) PTID=383', testUtil.createTest((create) => {
    var title1 = testUtil.PREFIX + 'calendar1';
    var title2 = testUtil.PREFIX + 'calendar2';
    var date = new Date();
    // fix the startDate and endDate to avoid create cross days event.
    var startDate = new Date(date.getFullYear(), date.getMonth(), date.getDate(), 0);
    var endDate = new Date(date.getFullYear(), date.getMonth(), date.getDate(), 22);

    // add two events
    var env = create.course().with.student().and.calendarItem({overrides: {title: title1, startDate: startDate, endDate: endDate}}).and
      .calendarItem({overrides: {title: title2, startDate: startDate, endDate: endDate}}).exec();

    var calendarPage = testUtil.loginBaseCalendar(env.student);
    calendarPage.clearFTUE(controls.CalendarPage.Type.BaseCalendar);
    calendarPage.goToMonthView();

    // check two events exist
    calendarPage.assertCalendarItemExistsInMonth(title1);
    calendarPage.assertCalendarItemExistsInMonth(title2);
  }));

  it('should view assignment items in Due Dates PTID=380', testUtil.createTest((create) => {
    var dueDate = new Date();
    // One hour later
    var dueDateOneHourLater = new Date(dueDate.getFullYear(), dueDate.getMonth(), dueDate.getDate(), dueDate.getHours() + 1);
    // Three days later
    var dueDateThreeDaysLater = new Date(dueDate.getFullYear(), dueDate.getMonth(), dueDate.getDate() + 3);
    // One Week later
    var dueDateOneWeekLater = new Date(dueDate.getFullYear(), dueDate.getMonth(), dueDate.getDate() + 7);

    var env =
      create
        .course().with
        .instructor()
        .and.student()
        .and.assignment({overrides: {assignment: {gradingColumn: {dueDate: dueDateOneHourLater}}}})
        .and.assignment({overrides: {assignment: {gradingColumn: {dueDate: dueDateThreeDaysLater}}}})
        .and.assignment({overrides: {assignment: {gradingColumn: {dueDate: dueDateOneWeekLater}}}})
        .exec();

    var calendarPage = testUtil.loginBaseCalendar(env.student);
    calendarPage.clearFTUE(controls.CalendarPage.Type.BaseCalendar);
    calendarPage.goToDueDates();
    var assignments = env.assignments;

    assignments.forEach((assignment: any) => {
      calendarPage.assertAssignmentExists(assignment.title);
    });
  }));

});