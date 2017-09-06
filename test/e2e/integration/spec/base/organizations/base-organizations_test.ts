import testUtil = require('../../../../test_util');

describe('On organizations page student should be able to', function() {

  it('access organization PTID=377', testUtil.createTest((create) => {
    var name = testUtil.randomString();
    var env = create.organization({overrides: {name: name}}).with.student().exec();
    testUtil.loginBaseOrganizations(env.student).openOrganization(name, env.organization.id);
  }));

});