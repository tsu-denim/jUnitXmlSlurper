import testUtil = require('../../../../test_util');

describe('The course roster page', () => {

  it('allows instructor to add / remove / modify users in the course PTID=359', testUtil.createTest((create) => {
    //Init
    var env = create.course().with.instructor().and.student().exec();
    var courseRosterPage = testUtil.loginBaseCourses(env.instructor)
      .openCourse(env.course.id)
      .openRoster().switchToListView();

    // Remove student
    courseRosterPage
      .assertEnrollmentCount(2)
      .search()
      .enterSearchText(env.student.familyName)
      .removeUser(env.student.givenName + ' ' + env.student.familyName)
      .search()
      .assertEnrollmentCount(1);

    // Enroll student back
    courseRosterPage
      .enrollUser(env.student.familyName)
      .assertEnrollmentCount(2);

    // Set allowed to false
    courseRosterPage
      .allowUserAccess(env.student.givenName + ' ' + env.student.familyName, false)
      .assertUserNotAllowed(env.student.givenName + ' ' + env.student.familyName);

    // Set allowed to true
    courseRosterPage
      .allowUserAccess(env.student.givenName + ' ' + env.student.familyName, true)
      .assertUserAllowed(env.student.givenName + ' ' + env.student.familyName);

    // Change user role
    courseRosterPage
      .search()
      .enterSearchText(env.student.familyName)
      .setUserRole(env.student.givenName + ' ' + env.student.familyName, 'Grader')
      .search()
      .assertRole(env.student.givenName + ' ' + env.student.familyName, 'grader');
  }));

  it('adheres to privacy restrictions when displaying user information PTID=556', testUtil.createTest((create) => {
    var emailAddress = 'test-user@blackboard.com';
    var company = 'Blackboard';
    var phoneNumber = '555-123-4567';
    var streetAddress = '123 Main St.';

    var env = create.course()
      .with.instructor()
      .and.with.student({overrides: {givenName: 'givenNameA', familyName: 'familyNameA'}})
      .and.with.student({overrides: {
        givenName: 'givenNameB',
        familyName: 'familyNameB',
        emailAddress: emailAddress,
        company: company,
        homePhone1: phoneNumber,
        street1: streetAddress}})
      .and.with.student({overrides: {
        givenName: 'givenNameC',
        familyName: 'familyNameC',
        emailAddress: emailAddress,
        homePhone1: phoneNumber,
        street1: streetAddress}})
      .exec();

    testUtil.loginBaseProfile(env.students[1])
      .openChangePrivacyPanel()
      .setVisibilityToClassmates()
      .save();

    testUtil.logout();

    var courseRosterPage = testUtil.loginBaseCourses(env.students[0])
      .openCourse(env.course.id)
      .openRoster().switchToListView();

    courseRosterPage
      .openEditRosterPanel(env.students[1].givenName + ' ' + env.students[1].familyName)
      .openAccountInformation()
      .assertEmailDisplayed(emailAddress)
      .assertCompanyDisplayed(company)
      .assertPhoneNumberDisplayed(phoneNumber)
      .assertStreetAddressDisplayed(streetAddress)
      .close();

    courseRosterPage
      .openEditRosterPanel(env.students[2].givenName + ' ' + env.students[2].familyName)
      .openAccountInformation()
      .assertUserInfoNotDisplayed()
      .close();
  }));
});