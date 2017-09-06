## Guidelines to create new workflow:

* Category workflow per user role (e.g., instructor, student or admin) and put into different sub-folder
* Each workflow should only define one Workflow class extending from abstract class TestWorkflow
* Each workflow should start from base page and return to base page at the end
* Each workflow should support execute repeatedly at each run