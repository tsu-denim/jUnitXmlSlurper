import java.util.stream.Collectors

lib = new jUnitReportXmlSlurper()
reportPath = "./testXml"
tests = lib.getTestReportSummary(reportPath);

println "Running Unit Tests..."

//Check that failed tests are counted properly
assert tests.testFailureCount == 4
assert tests.failedTestList.size() ==4
//Check that skipped tests are counted properly
assert tests.testSkipCount == 2
assert tests.skippedTestList.size() ==2
//Check that passed tests are counted properly
assert tests.testPassCount == 5
assert tests.passedTestList.size() == 5
//Test that list is filtering distinct paths: There are four failed tests but only 3 files with failures.
assert tests.getFailedTestReportPaths().size() == 3
//Check to see if the total executions equal expected amount
assert tests.testExecutionList.size() == 11
//Make sure sum of counts equal total list size
assert tests.testFailureCount + tests.testPassCount + tests.testSkipCount == tests.testExecutionList.size()

println "Finished!"