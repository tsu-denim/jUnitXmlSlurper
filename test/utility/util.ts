import path = require('path');

export var PREFIX = '_int_test_';

export function pathFromUltraUIRoot(pathRelativeToUltraUIRoot?: string) {
  return path.resolve(__dirname, '../../../../', pathRelativeToUltraUIRoot || '');
}

// Since "<ultra_ui_root>/test/e2e/test_util.ts" includes the dependency to protractor, APIs under "test_data" directory which depend on "test_util.ts" can not be invoked without protractor
// environment. That's the reason why extracting those utilities into this new file and re-export them in "test_util.ts" to keep compatibility with the existing code which requires them.
// TODO: Move more utilities in "test_util.ts" independent of protractor into this file to make it clean and sharable.