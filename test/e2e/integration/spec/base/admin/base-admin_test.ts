import testUtil = require('../../../../test_util');

describe('The admin page', function () {
  it('should close using close link PTID=304', testUtil.createTest((create) => {
    var env = create.systemAdmin().exec();
    testUtil.loginBaseAdmin(env.user).closeWithCloseLink();
  }));
});