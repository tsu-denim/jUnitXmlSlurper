import controls = require('../../../../controls/index');
import testUtil = require('../../../../test_util');

describe('The course calendar page for an instructor member of a course', () => {

  var startDate: Date;
  var endDate: Date;
  var date = new Date();
  startDate = new Date(date.getFullYear(), date.getMonth(), date.getDate(), 9, 0);
  endDate = new Date(date.getFullYear(), date.getMonth(), date.getDate(), 10, 0);

  it('should create a new course schedule PTID=392', testUtil.createTest((create) => {
    let env = create.course().with.instructor().and.student().exec();

    // Log in as instructor, and add an event
    let courseCalendarPage = testUtil.loginBaseCourses(env.instructor)
      .openCourse(env.course.id)
      .openCalendar();

    let title = testUtil.PREFIX + 'calendar';

    courseCalendarPage.addCalendarCourseScheduleForInstructor({title: title, startDate: startDate, endDate: endDate});
    courseCalendarPage.assertCalendarItemExists(title);
  }));

  it('should edit an existing course schedule PTID=405', testUtil.createTest((create) => {
    let recurRules: any = {freq: 'DAILY', interval: 1, endsBy: null, count: 10, byWeekDay: [], timeZoneId: 'Asia/Shanghai', until: ''};
    let env = create.course().with.instructor().and.student().and
      .courseSchedule({overrides: {startDate: startDate, endDate: endDate, recurRules: recurRules}}).exec();

    // Log in as instructor, and edit an event
    let courseCalendarPage = testUtil.loginBaseCourses(env.instructor)
      .openCourse(env.course.id)
      .openCalendar();

    let updatedTitle = testUtil.PREFIX + '_update';
    courseCalendarPage.editCalendarCourseScheduleForInstructor({title: updatedTitle, startDate: startDate, endDate: endDate});
    courseCalendarPage.assertCalendarItemExists(updatedTitle);

    testUtil.logout();

    // Log in as student, student should see the event.
    courseCalendarPage = testUtil.loginBaseCourses(env.student)
      .openCourse(env.course.id)
      .openCalendar();
    courseCalendarPage.assertCalendarItemExists(updatedTitle);
  }));

  it('should delete an existing course schedule PTID=406', testUtil.createTest((create) => {

    let recurRules: any = {freq: 'DAILY', interval: 1, endsBy: null, count: 10, byWeekDay: [], timeZoneId: 'Asia/Shanghai', until: ''};
    let env = create.course().with.instructor().and.student().and
      .courseSchedule({overrides: {startDate: startDate, endDate: endDate, recurRules: recurRules}}).exec();
    // Log in as instructor, and edit an event
    let courseCalendarPage = testUtil.loginBaseCourses(env.instructor)
      .openCourse(env.course.id)
      .openCalendar();

    // Because when I use 'env.calendarItem[0]' encounter error 'Cannot read property "0" of undefined', I was trying to find out the reason of error
    // but didn't make it, so I write a getCourseScheduleName method to get the course schedule's name as a workaround
    let courseScheduleTitle = courseCalendarPage.getCourseScheduleName();
    courseCalendarPage.removeCalendarCourseScheduleForInstructor();
    courseCalendarPage.assertCalendarItemDoesNotExist(courseScheduleTitle);

    testUtil.logout();

    // Log in as student, student should see the event.
    courseCalendarPage = testUtil.loginBaseCourses(env.student)
      .openCourse(env.course.id)
      .openCalendar();
    courseCalendarPage.assertCalendarItemDoesNotExist(courseScheduleTitle);
  }));

  // ULTRA-20162 Error: No visible instances of (#panel-title) were found
  it('should create a new office hours (#quarantine) PTID=410', testUtil.createTest((create) => {
    let title = testUtil.PREFIX + 'office_hours';
    let env = create.course().with.student()
      .and.instructor().exec();

    // Log in as instructor, and add an office hours item
    let courseCalendarPage = testUtil.loginBaseCourses(env.instructor)
      .openCourse(env.course.id)
      .openCalendar();
    courseCalendarPage.addCalendarOfficeHoursForInstructor({title: title, startDate: startDate, endDate: endDate});
    courseCalendarPage.assertCalendarItemExists(title);
  }));

  it('should edit an existing office hours PTID=411', testUtil.createTest((create) => {
    let title = testUtil.PREFIX + 'office_hours';
    let updatedTitle = title + '_updated';
    let env = create.course().with.student()
      .and.instructor()
      .with.officeHours({overrides: {title: title}}).exec();

    // Log in as instructor
    let courseCalendarPage = testUtil.loginBaseCourses(env.instructor)
      .openCourse(env.course.id)
      .openCalendar();

    //Edit the title
    courseCalendarPage.editOfficeHours(title, {title: updatedTitle});
    courseCalendarPage.assertCalendarItemExists(updatedTitle);

    testUtil.logout();

    // Log in as student, student should see the office hours updated as well
    courseCalendarPage = testUtil.loginBaseCourses(env.student)
      .openCourse(env.course.id)
      .openCalendar()
      .assertCalendarItemExists(updatedTitle);
  }));

  it('should delete an existing office hours PTID=412', testUtil.createTest((create) => {
    let title = testUtil.PREFIX + 'office_hours_item_title';
    let env = create.course().with.student()
      .and.instructor()
      .with.officeHours({overrides: {title: title}}).exec();

    // Log in as instructor, and delete this office hours item
    let courseCalendarPage = testUtil.loginBaseCourses(env.instructor)
      .openCourse(env.course.id)
      .openCalendar();

    courseCalendarPage.removeCalendarItem(title);
    courseCalendarPage.assertCalendarItemDoesNotExist(title);

    testUtil.logout();

    // Log in as student, student should not see the office hours
    courseCalendarPage = testUtil.loginBaseCourses(env.student)
      .openCourse(env.course.id)
      .openCalendar()
      .assertCalendarItemDoesNotExist(title);
  }));

  it('should create a new event PTID=379', testUtil.createTest((create) => {
    let env = create.course().with.instructor().and.student().exec();
    // Log in as instructor, and add an event
    let courseCalendarPage = testUtil.loginBaseCourses(env.instructor)
      .openCourse(env.course.id)
      .openCalendar();
    let title = testUtil.PREFIX + 'calendar';
    courseCalendarPage.addCalendarItemForInstructor({title: title});
    courseCalendarPage.assertCalendarItemExists(title);
  }));

  // ULTRA-23174 Error: More than one visible instance of (By(link text, _int_test_calendar_updated)) was found!
  it('should edit an existing event (#quarantine) PTID=387', testUtil.createTest((create) => {
    let title = testUtil.PREFIX + 'calendar';
    let env = create.course().with.instructor().and.student().and
      .calendarItem({overrides: {title: title, startDate: startDate, endDate: endDate}}).exec();
    // Log in as instructor, and edit an event
    let courseCalendarPage = testUtil.loginBaseCourses(env.instructor)
      .openCourse(env.course.id)
      .openCalendar();

    let updatedTitle = title + '_updated';
    courseCalendarPage.editCalendarItem(title, {title: updatedTitle, startDate: startDate, endDate: endDate});
    courseCalendarPage.assertCalendarItemExists(updatedTitle);

    testUtil.logout();

    // Log in as student, student should see the event.
    courseCalendarPage = testUtil.loginBaseCourses(env.student)
      .openCourse(env.course.id)
      .openCalendar();
    courseCalendarPage.assertCalendarItemExists(updatedTitle);
  }));

  it('should delete an existing event PTID=388', testUtil.createTest((create) => {
    let title = testUtil.PREFIX + 'calendar';
    let env = create.course().with.instructor().and.student().and
      .calendarItem({overrides: {title: title, startDate: startDate, endDate: endDate}}).exec();

    // Log in as student, student should see the event.
    let courseCalendarPage = testUtil.loginBaseCourses(env.student)
      .openCourse(env.course.id)
      .openCalendar();
    courseCalendarPage.assertCalendarItemExists(title);

    testUtil.logout();

    // Log in as instructor, and remove the existing event
    courseCalendarPage = testUtil.loginBaseCourses(env.instructor)
      .openCourse(env.course.id)
      .openCalendar();
    courseCalendarPage.removeCalendarItem(title);
    courseCalendarPage.assertCalendarItemDoesNotExist(title);

    testUtil.logout();

    // Log in as student, student should not see the event any more.
    courseCalendarPage = testUtil.loginBaseCourses(env.student)
      .openCourse(env.course.id)
      .openCalendar();
    courseCalendarPage.assertCalendarItemDoesNotExist(title);
  }));

});