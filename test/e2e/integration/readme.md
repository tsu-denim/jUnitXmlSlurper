# E2E tests

## Initial setup
There is no special setup required. Just make sure you've already done a `./update.sh` (`grunt update-internal`, on Windows), which includes downloading and installing the standalone Selenium server and Chrome driver required for running the protractor tests.

## Running the tests
Run the E2E tests from a terminal window with the `grunt test:e2e` task. This will run them against the server specified in the [app config file](../../config/config.js). By default this is http://localhost:9901.

To run against another Ultra server, simply specify the `baseUrl` option to the command.

For example:
` grunt test:e2e --baseUrl=https://jhuang.local:8443`

See all the relevant [grunt tasks](../../readme.md) in the project README file for running tests.

## Debugging tests

Add `browser.pause()` to your tests and run the tests normally using `grunt test:e2e`

## Configuration

The configuration file is at [test/e2e/protractor.conf.js](./protractor.conf.js)
