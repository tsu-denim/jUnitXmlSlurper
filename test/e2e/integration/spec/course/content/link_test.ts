import controls = require('../../../../controls/index');
import testUtil = require('../../../../test_util');

import {ElementFinderSync, browserSync, elementSync, polledExpect, waitFor, waitForNewWindow} from 'protractor-sync';

describe('A link item', function() {
  it('can be created successfully by instructor PTID=497', testUtil.createTest((create) => {
    var env = create.course().with.instructor().exec();
    testUtil.login(env.user);

    var basePage = new controls.BasePage.Control();

    var courseOutlinePage = basePage
      .openCourses()
      .openCourse(env.course.id)
      .getOutline();

    var linkName = testUtil.PREFIX + 'Test Link';
    var linkDescription = testUtil.PREFIX + 'this is the description';

    courseOutlinePage.addLinkToEmptyOutline({title: linkName, url: browserSync.getBrowser().baseUrl, description: linkDescription});

    // verify the item in the course outline
    var linkItem = courseOutlinePage.getContentItem(linkName);
    polledExpect(() => linkItem.getDescription()).toBe(linkDescription);

  }));

  it('can be opened by student PTID=535', testUtil.createTest((create) => {
    var env = create.course().with.student().and.externalLink().exec();
    testUtil.loginBaseCourses(env.user);

    var coursesPage = new controls.BaseCoursesPage.Control();
    var courseOutline = coursesPage.openCourse(env.course.id)
                                   .getOutline();

    // open link and assert
    var currentWindowHandle = browserSync.getWindowHandle();
    waitForNewWindow(() => {
      courseOutline.getContentItem( env.externalLink.title ).clickContentTitle();
    });
    polledExpect(() => browserSync.getCurrentUrl()).toMatch(/\/ultra\/stream/);
    browserSync.getBrowser().driver.close();
    browserSync.switchTo().window(currentWindowHandle);
  }));

  it('indicates its visibility after it is saved PTID=536', testUtil.createTest((create) => {
    var env = create.course().with.instructor().exec();

    var courseOutlinePage = testUtil.loginBaseCourses(env.user)
      .openCourse(env.course.id)
      .getOutline();

    var linkName = testUtil.PREFIX + 'Test Link';

    courseOutlinePage.addLinkToEmptyOutline({ title: linkName, url: 'google.com'});

    courseOutlinePage.getContentItem(linkName).getVisibilitySelector().assertHidden();
  }));
});
