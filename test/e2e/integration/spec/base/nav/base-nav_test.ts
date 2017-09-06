import testUtil = require('../../../../test_util');

describe('The base page', () => {
  it('allows the user to navigate to the base pages (#avalon #shaky) PTID=4', testUtil.createTest((create) => {
    var env = create.systemAdmin().exec();
    var basePage = testUtil.loginBase(env.user);

    basePage.openProfile(); //Verification is handled in page controls
    basePage.openStream();
    basePage.openCourses();
    basePage.openOrganization();
    basePage.openCalendar();
    basePage.openMessages();
    basePage.openGrades();
    basePage.openTools();

    basePage.signOut();
  }));
});
