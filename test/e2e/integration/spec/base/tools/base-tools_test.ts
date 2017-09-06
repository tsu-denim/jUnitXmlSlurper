import testUtil = require('../../../../test_util');

describe('The tools page', function () {
  it('should open all tools PTID=356', testUtil.createTest((create) => {
    var env = create.systemAdmin().exec();
    //TODO:  Once learn backend is installed with content collection disabled, we can make an explicit check for it not showing
    testUtil.loginBaseTools(env.user)
      .openEnterpriseSurveys()
        .close()
      .openGoals()
        .close();
  }));
});
