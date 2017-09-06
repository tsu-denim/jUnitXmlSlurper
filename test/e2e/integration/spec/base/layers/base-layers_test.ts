import controls = require('../../../../controls/index');
import testUtil = require('../../../../test_util');

describe('The layers', () => {
  it('should let the user navigate panels PTID=349', testUtil.createTest((create) => {
    if (testUtil.getCurrentBreakpoint() !== testUtil.Breakpoint.Large) {
      return; //Layers can't be fanned on small and medium BP
    }

    var env = create.course().with.instructor().exec();
    var baseCourses = testUtil.loginBaseCourses(env.user);
    var basePage = new controls.BasePage.Control();

    //selecting top level keeps things as they were
    baseCourses.openCourse(env.course.id).openRoster();
    basePage.fanOutLayers()
      .assertLayersCount(3)
      .selectLayer(3)
      .assertLayersCount(3);

    // selecting base layer closes all other layers
    basePage.fanOutLayers()
      .assertLayersCount(3)
      .selectLayer(1)
      .assertOnlyBaseLayerVisible();

    // selecting middle layer closes layers on top
    baseCourses.openCourse(env.course.id).openRoster();
    basePage.fanOutLayers()
      .selectLayer(2)
      .assertLayersCount(2);

    // escape closes a panel
    basePage.pressEscWhileInTopPanel()
      .assertTopLayerStillVisible();
  }));
});
