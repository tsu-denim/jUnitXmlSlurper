/* TODO: These tests will be reorganized and updated to reflect the final performance test requirements then this file will be removed
import controls = require('../../controls/index');
import enums = require('../../controls/enums/index');
import testUtil = require('../../test_util');

import {TestProfiler} from '../test-profiler';

// moment().format('YYYY-MM-DD_HH-mm-ss')

describe('Performance Assessment > Page Response Time', function() {
  // Base Profile
  it('Base profile (#performance)', testUtil.createTest((create) => {
    var profile = new TestProfiler();

    var env = create.user().exec();

    profile.start('Profile: Login base profile page', 'User');
    var baseProfile = testUtil.loginBaseProfile(env.user);
    profile.record('Profile: Login base profile page');

    profile.start('Profile: Open edit contact info panel', 'User');
    var contactInfoPanel = baseProfile.openEditContactInfoPanel();

    contactInfoPanel.expandAdditionalInformationPane();
    polledExpect(() => contactInfoPanel.hasMobilePhoneNumberInputVisible()).toBe(true);

    profile.record('Profile: Open edit contact info panel');

    var newFamilyName = testUtil.randomString();
    profile.start('Profile: Change contact info and save', 'User');
    contactInfoPanel.setFamilyNameInputValue(newFamilyName);
    contactInfoPanel.save();
    polledExpect(() => contactInfoPanel.isPresent()).toBe(false);
    profile.record('Profile: Change contact info and save');

    profile.start('Profile: Open privacy settings panel', 'User');
    var privacySettingsPanel = baseProfile.openPrivacySettingsPanel();
    polledExpect(() => privacySettingsPanel.isPresent()).toBe(true);
    profile.record('Profile: Open privacy settings panel');
    privacySettingsPanel.cancel();
    polledExpect(() => privacySettingsPanel.isPresent()).toBe(false);

    profile.start('Profile: Open change profile picture panel', 'User');
    var changeAvatarPanel = baseProfile.openChangeAvatarPanel();
    profile.record('Profile: Open change profile picture panel');

    var avatarFilename = 'avatar.png';
    profile.start('Profile: Upload profile picture', 'User');
    changeAvatarPanel.uploadAvatar();
    profile.record('Profile: Upload profile picture');
    changeAvatarPanel.closePanel();

    profile.start('Profile: Open change password panel', 'User');
    var chgPwdPanel = baseProfile.openChangePasswordPanel();
    profile.record('Profile: Open change password panel');

    var newPassword = testUtil.randomString();
    profile.start('Profile: Change password and save', 'User');
    chgPwdPanel.setOldPasswordInputValue(env.user.password)
      .setNewPasswordInputValue(newPassword)
      .setConfirmNewPasswordInputValue(newPassword)
      .save();
    profile.record('Profile: Change password and save');

    profile.end();
  }));

  // Base Activity Stream
  var baseActivityStreamTest = testUtil.createTest((create) => {
    var course = create.course();
    // 6 entries in total
    var assignmentTitle = testUtil.PREFIX + 'Assignment due in the future';
    course.with.instructor().and.student().and.assignment({
      overrides: {assignment: {gradingColumn: {columnName: assignmentTitle}, assessment: {title: assignmentTitle}}}
    });
    for (var index = 1; index < 6; index++) {
      course.with.assignment();
    }
    var env = course.exec();

    profile.start('Activity Stream: Login base activity stream page (6 entries)', 'Student');
    var streamPage = testUtil.loginBaseActivityStream(env.student);
    polledExpect(() => streamPage.getStreamEntriesInUpcomingSection().some(item => item.getText() === 'Due: ' + assignmentTitle))
      .toBe(true);
    streamPage.assertShowMoreButtonExists();
    profile.record('Activity Stream: Login base activity stream page (6 entries)');

    profile.start('Activity Stream: Open assignment peek panel from entry', 'Student');
    streamPage.openItemPeekPanelToViewAssignment('Due: ' + assignmentTitle);
    profile.record('Activity Stream: Open assignment peek panel from entry');
  });

  it('Base activity stream -1 (#performance)', baseActivityStreamTest);
  for (var i=2, len=profile.getRuns(); i<=len; ++i) {
    it(`Base activity stream -${i} (#performance)`, baseActivityStreamTest);
  }

  // Base Courses
  var baseCourses = testUtil.createTest((create) => {
    var env = create.course(({ overrides: { description: 'Course_Description' }})).with.instructor().exec();

    profile.start('Courses: Login base courses', 'Instructor');
    var baseCourses = testUtil.loginBaseCourses(env.instructor);
    profile.record('Courses: Login base courses');

    profile.start('Courses: View course description', 'Instructor');
    var courseDescriptionPeekPanel = baseCourses.getCourseCard(env.course.id).openDescriptionPeekPanel();
    polledExpect(() => courseDescriptionPeekPanel.getCourseDescription().getText()).toBe('Course_Description');
    profile.record('Courses: View course description');
  });

  it('Base courses -1 (#performance)', baseCourses);
  for (var i=2, len=profile.getRuns(); i<=len; ++i) {
    it(`Base courses -${i} (#performance)`, baseCourses);
  }

  // Base Organizations

  // Base Calendar
  var baseCalendar = testUtil.createTest((create) => {
    var env = create.course().with.instructor().and.calendarItem().exec();

    profile.start('Calendar: Login base calendar (1 entry)', 'Instructor');
    var calendarPage = testUtil.loginBaseCalendar(env.instructor);
    var calendarItem = env.calendarItem[0];
    calendarPage.assertCalendarItemExists(calendarItem.title);
    profile.record('Calendar: Login base calendar (1 entry)');

    profile.start('Calendar: Update calendar item\'s title', 'Instructor');
    var updateTitle = calendarItem.title + ' updated';
    calendarPage.editCalendarItem(calendarItem.title, {title: updateTitle});
    calendarPage.assertCalendarItemExists(updateTitle);
    profile.record('Calendar: Update calendar item\'s title');

    profile.start('Calendar: Create new calendar item', 'Instructor');
    var title = testUtil.PREFIX + 'course_calendar_item_title';
    calendarPage.addCalendarItemForInstructor({title: title});
    calendarPage.assertCalendarItemExists(title);
    profile.record('Calendar: Create new calendar item');

    profile.start('Calendar: Remove the existing calendar item', 'Instructor');
    calendarPage.removeCalendarItem(updateTitle);
    calendarPage.assertCalendarItemDoesNotExist(updateTitle);
    profile.record('Calendar: Remove the existing calendar item');
  });

  it('Base calendar > Instructor -1 (#performance)', baseCalendar);
  for (var i=2, len=profile.getRuns(); i<=len; ++i) {
    it(`Base calendar > Instructor -${i} (#performance)`, baseCalendar);
  }

  var baseCalendarStu1 = testUtil.createTest((create) => {
    var date = new Date();
    var startDate = new Date(date.getFullYear(), date.getMonth(), date.getDate(), 0);
    var endDate = new Date(date.getFullYear(), date.getMonth(), date.getDate(), 22);
    var title = testUtil.PREFIX + 'personal_calendar_item_title';

    var env = create.course().with.student().with.calendarItem().and.calendarItem({overrides: {startDate: startDate, endDate: endDate, title: title}}).and
      .calendarItem({overrides: {startDate: startDate, endDate: endDate, title: title}}).exec();

    profile.start('Calendar: Login base calendar (1 entry) as student', 'Student');
    var calendarPage = testUtil.loginBaseCalendar(env.student);
    calendarPage.clearFTUE(controls.CalendarPage.Type.BaseCalendar);
    var calendarItem = env.calendarItem[0];
    calendarPage.assertCalendarItemExists(calendarItem.title);
    profile.record('Calendar: Login base calendar (1 entry) as student');

    profile.start('Calendar: Student update calendar item\'s title', 'Student');
    var updateTitle = calendarItem.title + ' updated';
    calendarPage.editCalendarItem(calendarItem.title, {title: updateTitle});
    calendarPage.assertCalendarItemExists(updateTitle);
    profile.record('Calendar: Student update calendar item\'s title');

    profile.start('Calendar: Student create new calendar item', 'Student');
    calendarPage.addCalendarItemForUserOrStudent({title: title});
    calendarPage.assertCalendarItemExists(title);
    profile.record('Calendar: Student create new calendar item');

    profile.start('Calendar: Student view items of previous-week', 'Student');
    calendarPage.goToPreviousWeek();
    calendarPage.assertCalendarItemDoesNotExist(calendarItem.title);
    profile.record('Calendar: Student view items of previous-week');

    profile.start('Calendar: Student view items of today', 'Student');
    calendarPage.goToToday();
    calendarPage.assertCalendarItemExists(updateTitle);
    calendarPage.assertCalendarItemExists(title);
    profile.record('Calendar: Student view items of today');

    profile.start('Calendar: Student remove the existing calendar item', 'Student');
    calendarPage.removeCalendarItem(updateTitle);
    calendarPage.assertCalendarItemDoesNotExist(updateTitle);
    profile.record('Calendar: Student remove the existing calendar item');

    profile.start('Calendar: Student view items in month', 'Student');
    calendarPage.goToMonthView();
    var calendarItems = env.calendarItems;
    calendarItems.forEach((calendarItem: any) => {
      calendarPage.assertCalendarItemExistsInMonth(title);
    });
    profile.record('Calendar: Student view items in month');
  });

  it('Base calendar > Student(I) -1 (#performance)', baseCalendarStu1);
  for (var i=2, len=profile.getRuns(); i<=len; ++i) {
    it(`Base calendar > Student(I) -${i} (#performance)`, baseCalendarStu1);
  }

  var baseCalendarStu2 = testUtil.createTest((create) => {
    var dueDate = new Date();
    var dueDateOneHourLater = new Date(dueDate.getFullYear(), dueDate.getMonth(), dueDate.getDate(), dueDate.getHours() + 1);
    var dueDateThreeDaysLater = new Date(dueDate.getFullYear(), dueDate.getMonth(), dueDate.getDate() + 3);
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

    profile.start('Calendar: Student view due items', 'Student');
    calendarPage.goToDueDates();
    var assignments = env.assignments;
    assignments.forEach((assignment: any) => {
      calendarPage.assertAssignmentExists(assignment.title);
    });
    profile.record('Calendar: Student view due items');
  });

  it('Base calendar > Student(II) -1 (#performance)', baseCalendarStu2);
  for (var i=2, len=profile.getRuns(); i<=len; ++i) {
    it(`Base calendar > Student(II) -${i} (#performance)`, baseCalendarStu2);
  }

  // Base Messages
  var baseMessages = testUtil.createTest((create) => {
    var course = create.course();
    course.with.instructor().and.student();
    for (var i: number = 0; i < 5; i++) {
      course.with.conversation({from: 'instructor', to: ['student']});
    }
    var env = course.exec();

    profile.start('Messages: Login base messages', 'Student');
    var baseMessages = testUtil.loginBaseMessages(env.student);
    profile.record('Messages: Login base messages');

    profile.start('Messages: View messages of the specific course', 'Student');
    var courseMessages = baseMessages.getCourseMessages(env.course.id);
    var defaultViewCount = 3;
    polledExpect(() => courseMessages.getMessageInfo().length).toEqual(defaultViewCount);
    courseMessages.toggleView();
    var messages = courseMessages.getMessageInfo().map((message) => message.text);
    polledExpect(() => messages.length).toEqual(env.conversations.length);
    profile.record('Messages: View messages of the specific course');

    profile.start('Messages: Delete the messages', 'Student');
    courseMessages.deleteFirstMessage();
    polledExpect(() => courseMessages.getMessageInfo().length).toEqual(env.conversations.length-1);
    profile.record('Messages: Delete the messages');

    profile.start('Messages: Compose the new messages', 'Student');
    var message = testUtil.PREFIX + ' Howdy!';
    courseMessages.createMessage()
      .clearFTUE() //The FTUE blocks the click into the field, so we have to get rid of it first
      .addRecipient(env.instructor.familyName, env.instructor.id)
      .setMessage(message)
      .send();

    polledExpect(() => {
      var messages = courseMessages.getMessageInfo();
      return messages.length && messages[env.conversations.length-1].text;
    }).toBe(message);
    profile.record('Messages: Compose the new messages');
  });

  it('Base messages -1 (#performance)', baseMessages);
  for (var i=2, len=profile.getRuns(); i<=len; ++i) {
    it(`Base messages -${i} (#performance)`, baseMessages);
  }

  // Base Grades
  var baseGradesInstructor = testUtil.createTest((create) => {
    var course = create.course();
    course.instructor().and.student().exec();
    var testWithQuestion = course.test().with.question({ questionType: enums.QuestionType.Essay });
    var assignment = course.assignment();

    var env = testWithQuestion.exec();
    var testTitle = env.test.title;
    testWithQuestion.and.submission({ from: 'student' }).exec();

    assignment.exec();
    env = assignment
      .with.submission({from: 'student'})
      .with.grade({from: 'instructor', postGrade: true})
      .exec();
    var asgTitle = env.assignment.title;

    profile.start('Grades: Login base grades as instructor', 'Instructor');
    var instructorCourseCard = testUtil.loginBaseGrades(env.instructor)
      .getInstructorCourseCard(env.course.name);
    profile.record('Grades: Login base grades as instructor');

    profile.start('Grades: View all course work as instructor', 'Instructor');
    instructorCourseCard
      .clearFTUE()
      .clickAllCourseworkToggle();
    profile.record('Grades: View all course work as instructor');

    profile.start('Grades: Open needs grading test and close', 'Instructor');
    instructorCourseCard
      .getColumn(testTitle)
      .assertGradeProgress(enums.ColumnSummaryStatus.NeedsGrading)
      .openSubmissionsByGradeColumnTitle(testTitle)
      .closePanel();
    profile.record('Grades: Open needs grading test and close');

    profile.start('Grades: Open posted assignment and close', 'Instructor');
    instructorCourseCard
      .getColumn(asgTitle)
      .assertGradeProgress(enums.ColumnSummaryStatus.AllPosted)
      .openSubmissionsByGradeColumnTitle(asgTitle)
      .closePanel();
    profile.record('Grades: Open posted assignment and close');

    profile.start('Grades: Open list view of course grades', 'Instructor');
    instructorCourseCard
      .openCourse(env.course.name)
      .clearFTUE()
      .assertListViewIsOpen();
    profile.record('Grades: Open list view of course grades');
  });

  it('Base grades for instructor -1 (#performance)', baseGradesInstructor);
  for (var i=2, len=profile.getRuns(); i<=len; ++i) {
    it(`Base grades for instructor -${i} (#performance)`, baseGradesInstructor);
  }

  var baseGradesStudent = testUtil.createTest((create) => {
    var course = create.course();
    course.instructor().and.student().exec();
    var assignment = course.assignment();
    var test = course.test().with.question({ questionType: enums.QuestionType.Essay });

    var env = assignment.exec();
    var asgTitle = env.assignment.title;
    env = assignment
      .with.submission({ from: 'student' })
      .with.grade({ from: 'instructor', postGrade: true })
      .exec();
    env = test.exec();
    var testTitle = env.test.title;

    // go into the base grades page as a student
    profile.start('Grades: Login base grades as student', 'Student');
    var basePage = testUtil.loginBaseGrades(env.student);
    var studentCourseCard = basePage.getStudentCourseCard(env.course.name);
    profile.record('Grades: Login base grades as student');

    profile.start('Grades: View all course work as student', 'Student');
    basePage
      .clearFTUE()
      .viewAllCoursework(env.course.displayName)
      .close();
    profile.record('Grades: View all course work as student');

    profile.start('Grades: View posted grade of the assignment', 'Student');
    studentCourseCard
      .getColumn(asgTitle)
      .getGrade();
    profile.record('Grades: View posted grade of the assignment');

    profile.start('Grades: Open attempt panel of the test', 'Student');
    studentCourseCard
      .getColumn(testTitle)
      .openViewItemPanel();
    var viewTestPanel = new controls.ViewerAssessmentOverviewPanel.Control();
    viewTestPanel.assertTitle(testTitle)
      .assertStartAttemptButton();
    profile.record('Grades: Open attempt panel of the test');
  });

  it('Base grades for student -1 (#performance)', baseGradesStudent);
  for (var i=2, len=profile.getRuns(); i<=len; ++i) {
    it(`Base grades for student -${i} (#performance)`, baseGradesStudent);
  }

  // Base Tools
  var baseTools = testUtil.createTest((create) => {
    var env = create.systemAdmin().exec();

    profile.start('Tools: Login base tools', 'Admin');
    var baseTools = testUtil.loginBaseTools(env.user);
    profile.record('Tools: Login base tools');

    profile.start('Tools: Open content collection page and close', 'Admin');
    var contentCollection = baseTools.openContentCollection();
    var basePage = new controls.BasePage.Control();
    polledExpect(() => basePage.isOffcanvasOpen()).toBeTruthy();
    contentCollection.close();
    polledExpect(() => basePage.isOffcanvasOpen()).toBeFalsy();
    profile.record('Tools: Open content collection page and close');

    profile.start('Tools: Open goals page and close', 'Admin');
    var goals = baseTools.openGoals();
    basePage = new controls.BasePage.Control();
    polledExpect(() => basePage.isOffcanvasOpen()).toBeTruthy();
    goals.close();
    polledExpect(() => basePage.isOffcanvasOpen()).toBeFalsy();
    profile.record('Tools: Open goals page and close');

    profile.start('Tools: Open enterprise surveys page and close', 'Admin');
    var enterpriseSurveys = baseTools.openEnterpriseSurveys();
    basePage = new controls.BasePage.Control();
    polledExpect(() => basePage.isOffcanvasOpen()).toBeTruthy();
    enterpriseSurveys.close();
    polledExpect(() => basePage.isOffcanvasOpen()).toBeFalsy();
    profile.record('Tools: Open enterprise surveys page and close');
  });

  it('Base tools -1 (#performance)', baseTools);
  for (var i=2, len=profile.getRuns(); i<=len; ++i) {
    it(`Base tools -${i} (#performance)`, baseTools);
  }

  // Base Admin
  var baseAdmin = testUtil.createTest((create) => {
    var env = create.systemAdmin().exec();

    profile.start('Admin: Login base admin', 'Admin');
    var adminPage = testUtil.loginBaseAdmin(env.user);
    adminPage.closeWithCloseLink();
    profile.record('Admin: Login base admin');
  });

  it('Base admin -1 (#performance)', baseAdmin);
  for (var i=2, len=profile.getRuns(); i<=len; ++i) {
    it(`Base admin -${i} (#performance)`, baseAdmin);
  }
});
*/