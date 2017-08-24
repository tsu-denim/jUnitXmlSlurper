#!/usr/bin/env groovy
import groovy.io.FileType
import java.util.stream.Collectors
import org.apache.commons.cli.*



reportPath = "./testXml"
tests = getTestReportSummary(reportPath);

println "Total Test Count is: " + tests.testExecutionList.size()







def getTestReportSummary(String resultPath){
    return new JunitTestReportSummary(resultPath)
}


public class JunitTestReportSummary {
    public final int testFailureCount;
    public final int testPassCount;
    public final int testSkipCount;
    public final List<TestExecution> testExecutionList;
    private final String testReportPath;

    //Prevent compiler from creating default zero arg constructor
    private JunitTestReportSummary() {
        assert false: "Zero argument constructor should not be called, object creation for this class requires a file path.";
    }

    public JunitTestReportSummary(String jUnitReportDirectoryPath) {
        if (riskyStringNotEmpty(jUnitReportDirectoryPath)) {
            this.testReportPath = jUnitReportDirectoryPath;
        } else {
            assert false: "Path to jUnit report directory was null or empty."
        }

        this.testExecutionList = getTestExecutionList();
        long failCount = testExecutionList.stream().filter({t -> t.isFailed}).count();
        long passCount = testExecutionList.stream().filter({t -> t.isPassed}).count();
        long skipCount = testExecutionList.stream().filter({t -> t.isSkipped}).count();

        this.testFailureCount = failCount.intValue();
        this.testPassCount = passCount.intValue();
        this.testSkipCount = skipCount.intValue();

    }

    //Checks a string for variations of being 'empty'
    private riskyStringNotEmpty(String riskyString) {
        boolean isNotEmpty = riskyString != null && !riskyString.trim().isEmpty();

        return isNotEmpty;
    }

    private List<TestExecution> getTestExecutionList(){
        return new JunitXmlReader(this.testReportPath).getTestExecutions();
    }

    public List<TestExecution> getFailedTestList() {
        return testExecutionList.stream().filter({t -> t.isFailed}).collect(Collectors.toList());
    }

    public List<TestExecution> getPassedTestList() {
        return testExecutionList.stream().filter({t -> t.isPassed}).collect(Collectors.toList());
    }

    public List<TestExecution> getSkippedTestList() {
        return testExecutionList.stream().filter({t -> t.isSkipped}).collect(Collectors.toList());
    }

    public List<String> getFailedTestReportPaths(){
        return testExecutionList.stream().filter({t -> t.isFailed}).map({t -> t.pathToJunitReport}).distinct().collect(Collectors.toList());
    }

}


public class JunitXmlReader{

    private final List<TestCaseElement> testCaseElementList;
    private final String directoryPath;

    public JunitXmlReader(String testReportDirectoryPath){
        this.directoryPath = testReportDirectoryPath;
        this.testCaseElementList = getTestCaseElementsFromFileSystem();

    }

    private List<TestCaseElement> getTestCaseElementsFromFileSystem() {
        def listOfFiles = []
        def fileContents = new File(this.directoryPath)
        fileContents.eachFileRecurse(FileType.FILES) { file ->
            listOfFiles << file

        }

        List<TestCaseElement> testCases = new ArrayList<>();

        listOfFiles.stream().filter({file -> file.path.contains(".xml")}).each{ thefile ->
            new XmlSlurper().parse(thefile.path).testsuite.testcase.each {

                Map<String, String> attributeMap = new HashMap<>();
                attributeMap.put("caseName", it.@name.toString());
                attributeMap.put("suiteName", it.@classname.toString());
                attributeMap.put("executionTime", it.@time.toString());
                attributeMap.put("filePath", thefile.path.toString());

                if (it.children().size() > 0){
                    it.children().each{
                        if (it.name() == "failure") {
                            attributeMap.put("outcome", "fail");
                        }
                        else if (it.name() == "skipped") {
                            attributeMap.put("outcome", "skip");
                        }
                    }
                }
                else {
                    attributeMap.put("outcome", "pass")
                }



                testCases.add(new TestCaseElement(attributeMap));
            }
        }
        return testCases;
    }


    public List<TestExecution> getTestExecutions(){
        List<TestExecution> testExecutionList = new ArrayList<>();
        this.testCaseElementList.each {testcase ->
            boolean passed = testcase.testCaseAttributes.get("outcome").equals("pass");
            boolean failed = testcase.testCaseAttributes.get("outcome").equals("fail");
            boolean skipped = testcase.testCaseAttributes.get("outcome").equals("skip");

            TestExecution testExecution = new TestExecution()
                    .withIsFailed(failed)
                    .withIsPassed(passed)
                    .withIsSkipped(skipped)
                    .withTestDuration(testcase.testCaseAttributes.get("executionTime"))
                    .withTestName(testcase.testCaseAttributes.get("caseName"))
                    .withTestGroup(testcase.testCaseAttributes.get("suiteName"))
                    .withPathToJunitReport(testcase.testCaseAttributes.get("filePath"));
            testExecutionList.add(testExecution);
        }
        return testExecutionList;
    }

}


public class TestCaseElement{
    public final Map<String, String> testCaseAttributes;

    public TestCaseElement(Map<String, String> attributes){
        this.testCaseAttributes = attributes;
    }
}


public class TestExecution {


    public String testName;
    public String testGroup;
    public String pathToJunitReport;
    public String testDuration;
    public boolean isPassed;
    public boolean isFailed;
    public boolean isSkipped;

    public TestExecution withTestName(String testName) {
        this.testName = testName;
        return this;
    }

    public TestExecution withTestGroup(String testGroup) {
        this.testGroup = testGroup;
        return this;
    }

    public TestExecution withPathToJunitReport(String pathToJunitReport) {
        this.pathToJunitReport = pathToJunitReport;
        return this;
    }

    public TestExecution withTestDuration(String testDuration) {
        this.testDuration = testDuration;
        return this;
    }

    public TestExecution withIsPassed(boolean isPassed) {
        this.isPassed = isPassed;
        return this;
    }

    public TestExecution withIsFailed(boolean isFailed) {
        this.isFailed = isFailed;
        return this;
    }

    public TestExecution withIsSkipped(boolean isSkipped) {
        this.isSkipped = isSkipped;
        return this;
    }

}
