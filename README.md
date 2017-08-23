# jUnitXmlSlurper
Consolidates a directory of jUnit XML test reports into a single summary object.

# Usage
Place jUnitReportXmlSlurper.groovy in the same directory as the groovy file you wish to use it from. The jUnitXmlSlurper must be invoked
like so:

```
lib = new jUnitReportXmlSlurper()
tests = lib.getTestReportSummary("./testXml");
```

# Running tests
Run the test script on the command line using the following command:

```
groovy xmlSlurperTests.groovy
```
