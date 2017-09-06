import controls = require('../../../../controls/index');
import testUtil = require('../../../../test_util');

describe('The calendar page for an instructor member of a course', () => {

  it('should see all courses names on course schedule peek panel PTID=416', testUtil.createTest((create) => {
    var env1 = create.course().with.instructor().exec();
    //TODO: Actually in this test we should create multiple courses with enrolled just one instructor, then when the instructor open
    //TODO: the course schedule peek panel can see all courses names, but for now don't know how to create multiple courses with only
    //TODO: one instructor by using create data api, so leave this part as to do.
    var courseName1 = env1.course.name;

    testUtil.loginBaseCalendar(env1.instructor)
      .openCourseSchedulePanelFromDropDown().assertCourseNameExists(courseName1); //Assert all courses names display on the page
  }));

  it('should not input invalid data into start/end date fields PTID=421', testUtil.createTest((create) => {
    var env = create.course()
      .with.instructor()
      .exec();

    //Instructor login ultra and open base calendar
    var calendarPage = testUtil.loginBaseCalendar(env.instructor);

    /**
     * Start/End date fields negative operation
     */
    function negativeOperationOnStartEndDate(date: string, time: string) {
      calendarPage
        ._openCalendarItemPanelFromDropdown() //open add event peek panel
        .clearStartDate() //clear start date field
        .assertEmptyDateErrorMessage() //to check 'Enter Start Date' warning message display
        .clearEndDate() //clear end date field
        .assertEmptyDateErrorMessage()  //to check 'Enter End Date' warning message display
        .inputStartDate(date) //input invalid date value into start date field
        .assertIncorrectDateFormateDisplay() //to check incorrect date format warning message display
        .inputEndDate(date) //input invalid date value into end date field
        .assertIncorrectDateFormateDisplay(); //to check incorrect date format warning message display
      //Because LRN-121619 blocked next test steps, so annotated them to make the test stable, will remove annotation once the bug is fixed
      //.inputStartTime(time) //input invalid time value into start time field
      //.assertIncorrectTimeFormateDisplay() //to check incorrect time format warning message display
      //.inputEndTime(time) //input invalid time value into end time field
      //.assertIncorrectTimeFormateDisplay(); //to check incorrect time format warning message display
    }

    //Do the negative test for start/end date fields
    negativeOperationOnStartEndDate('abc', '123');
  }));

  it('should use today button on day view and month view PTID=417', testUtil.createTest((create) => {
    var env = create.course()
      .with.instructor()
      .exec();

    //Instructor login ultra, go to base calendar page and clear the FTUE
    var calendarPage = testUtil.loginBaseCalendar(env.instructor);
    calendarPage.clearFTUE(controls.CalendarPage.Type.BaseCalendar);

    //Define currentDate to store today date value
    var currentDate = calendarPage.getCurrentDate();

    /**
     * Check today button works well in day view
     * Function requires that you are on today's date in the calendar for things to work.
     */
    function checkTodayButtonOnDayView(date: string) {
      calendarPage.assertTodayButtonNotDisplay(); //Verify today button not display on the page
      calendarPage.goToYesterday(); //Instructor go to yesterday
      calendarPage.assertTodayButtonDisplay(); //Verify today button display on the page
      calendarPage.goToToday(); //Instructor go to today
      calendarPage.assertBackToToday(date); //Verify today button not display on the page and back to current date
      calendarPage.goToPreviousWeek(); //Instructor go to previous week
      calendarPage.assertTodayButtonDisplay(); //Verify today button display on the page
      calendarPage.goToToday(); //Instructor go to today
      calendarPage.assertBackToToday(date); //Verify today button not display on the page and back to current date
      calendarPage.goToNextWeek(); //Instructor go to next week
      calendarPage.assertTodayButtonDisplay(); //Verify today button display on the page
      calendarPage.goToToday(); //Instructor goes to today so that subsequent calls to checkToday functions will work
    }

    /**
     * Check today button works well in month view
     * Function requires that you are on today's date in the calendar for things to work.
     */
    function checkTodayButtonOnMonthView(month: string) {
      calendarPage.assertTodayButtonNotDisplay(); //Verify today button not display on the page
      calendarPage.goToPreviousMonth(); //Instructor go to previous month
      calendarPage.assertTodayButtonDisplay(); //Verify today button display on the page
      calendarPage.goToToday(); //Instructor go to today
      calendarPage.assertBackToCurrentMonth(month); //Verify today button not display on the page and back to current month
      calendarPage.goToNextMonth(); //Instructor go to next month
      calendarPage.assertTodayButtonDisplay(); //Verify today button display on the page
      calendarPage.goToToday(); //Instructor goes to today so that subsequent calls to checkToday functions will work
    }

    //Do the test for today button on day view
    checkTodayButtonOnDayView(currentDate);

    //Instructor go to month view
    calendarPage.goToMonthView();
    //Define currentMonth to store current month value
    var currentMonth = calendarPage.getCurrentMonth();

    //Do the test for today button on month view
    //Small breakpoints seem to not have this functionality so skip if small
    if (testUtil.getCurrentBreakpoint() !== testUtil.Breakpoint.Small) {
      checkTodayButtonOnMonthView(currentMonth);
    }

  }));

  it('should create a new all day repeat event PTID=418', testUtil.createTest((create) => {
    var env = create.course().with.instructor().exec();

    var title = testUtil.PREFIX + 'calendar';
    var calendarPage = testUtil.loginBaseCalendar(env.instructor)
      .addCalendarItemForInstructor({title: title, allDay: true, repeat: true});

    //Assert the new all day repeat event display on the page
    calendarPage.assertAllDayEventExists(title);
  }));

  it('should edit an existing all day repeat event PTID=419', testUtil.createTest((create) => {
    var date = new Date();
    var title = testUtil.PREFIX + 'calendar';
    var startDate = new Date(date.getFullYear(), date.getMonth(), date.getDate(), 0, 0);
    var endDate = new Date(date.getFullYear(), date.getMonth(), date.getDate(), 23, 59);
    var recurRules: any = {freq: 'DAILY', interval: 1, endsBy: null, count: 10, byWeekDay: [], timeZoneId: 'Asia/Shanghai', until: ''};
    var env = create.course().with.instructor().and.calendarItem({overrides: {title: title, startDate: startDate, endDate: endDate, recurRules: recurRules}}).exec();
    //Instructor login ultra and go to base calendar
    var calendarPage = testUtil.loginBaseCalendar(env.instructor);

    //Instructor update the event's title
    var updatedTitle = title + '_updated';
    calendarPage.editAllDayCalendarItem(title, {title: updatedTitle});

    //Assert event's title is updated
    calendarPage.assertAllDayEventExists(updatedTitle);
  }));

  it('should delete an existing all day repeat event PTID=420', testUtil.createTest((create) => {
    var date = new Date();
    var title = testUtil.PREFIX + 'calendar';
    var startDate = new Date(date.getFullYear(), date.getMonth(), date.getDate(), 0, 0);
    var endDate = new Date(date.getFullYear(), date.getMonth(), date.getDate(), 23, 59);
    var recurRules: any = {freq: 'DAILY', interval: 1, endsBy: null, count: 10, byWeekDay: [], timeZoneId: 'Asia/Shanghai', until: ''};
    var env = create.course().with.instructor().and.calendarItem({overrides: {title: title, startDate: startDate, endDate: endDate, recurRules: recurRules}}).exec();
    //Instructor login ultra and go to base calendar
    var calendarPage = testUtil.loginBaseCalendar(env.instructor);

    //Instructor delete the event
    calendarPage.removeAllDayCalendarItem(title);

    //Assert the event not display on the base calendar any more
    calendarPage.assertCalendarItemDoesNotExist(title);
  }));

  // ULTRA-23174 Error: More than one visible instance of (By(link text, _int_test_calendar)) was found!
  it('should create a new event (#avalon #shaky #quarantine) PTID=378', testUtil.createTest((create) => {
    var env = create.course().with.instructor().exec();
    var date = new Date();
    var startDate = new Date(date.getFullYear(), date.getMonth(), date.getDate(), 9, 0);  //today at 9 AM
    var endDate = new Date(date.getFullYear(), date.getMonth(), date.getDate(), 10, 0);  //today at 10 AM

    var title = testUtil.PREFIX + 'calendar';
    var calendarPage = testUtil.loginBaseCalendar(env.instructor)
      .addCalendarItemForInstructor({title: title, startDate: startDate, endDate: endDate});

    calendarPage.assertCalendarItemExists(title);
  }));

  it('should edit an existing event PTID=385', testUtil.createTest((create) => {
    var title = testUtil.PREFIX + 'calendar';
    var env = create.course().with.instructor().and.calendarItem({overrides: {title: title}}).exec();
    var calendarPage = testUtil.loginBaseCalendar(env.instructor);

    var updatedTitle = title + '_updated';
    calendarPage.editCalendarItem(title, {title: updatedTitle});
    calendarPage.assertCalendarItemExists(updatedTitle);
  }));

  it('should delete an existing event PTID=386', testUtil.createTest((create) => {
    var title = testUtil.PREFIX + 'calendar';
    var env = create.course().with.instructor().and.calendarItem({overrides: {title: title}}).exec();

    var calendarPage = testUtil.loginBaseCalendar(env.instructor);
    calendarPage.removeCalendarItem(title);
    calendarPage.assertCalendarItemDoesNotExist(title);
  }));

});