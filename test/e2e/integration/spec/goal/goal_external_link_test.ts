//ToDO - erroring out so bring these e2es into goals_test.ts
/*
import controls = require('../../../controls/index');
import testUtil = require('../../../test_util');
import enums = require('../../../controls/enums/index');
import {ElementFinderSync, browserSync, elementSync, polledExpect, waitFor} from 'protractor-sync';

describe('Goal alignment with External Link', function () {

    // ULTRA-18941 Goals are not always immediately ready for alignment after creation
    it('Instructor can align goals for URL (#defer) PTID=153', testUtil.createTest((create) => {

        let goalSet = create.goalSet();
        try {

            let env = goalSet.goalCategory().goal().and.goal().exec();
            env = create.course().with.instructor().and.externalLink().exec();

            let editPanel = testUtil.loginBaseCourses(env.user).openCourse(env.course.id)
                .getOutline().getContentItem(env.externalLink.title).openUrlLinkEditor();

            let goalPicker = editPanel.addGoals();
            env.goals.forEach(goal => goalPicker.selectGoal(goal.stdId));
            goalPicker.submit();
            polledExpect(() => editPanel.getNumOfGoals()).toBe(2);
            let goalAlignment = editPanel.viewGoals();
            polledExpect(() => goalAlignment.getNumOfGoals()).toBe(2);
        } finally {
            goalSet.delete().exec();
        }
    }));

    // ULTRA-18941 Goals are not always immediately ready for alignment after creation
    it('Instructor can edit aligned goals for URL (#defer) PTID=154', testUtil.createTest((create) => {
        let goalSet = create.goalSet();
        try {
            let env = goalSet.goalCategory().goal().and.goal().exec();
            env = create.course().with.instructor().and.externalLink().alignGoals(env.goals).exec();
            let linkEditPanel = testUtil.loginBaseCourses(env.user).openCourse(env.course.id)
                .getOutline().getContentItem(env.externalLink.title).openUrlLinkEditor();

            polledExpect(() => linkEditPanel.getNumOfGoals()).toBe(2);
            let goalAlignment = linkEditPanel.viewGoals();
            polledExpect(() => goalAlignment.getNumOfGoals()).toBe(2);
            let goal = goalAlignment.getGoal(env.goal.stdId);
            goal.checkContents(env);
            goal.delete();
            polledExpect(() => goalAlignment.getNumOfGoals()).toBe(1);
            goalAlignment.addGoals().selectGoal(env.goal.stdId).submit();
            polledExpect(() => goalAlignment.getNumOfGoals()).toBe(2);
        } finally {
            goalSet.delete().exec();
        }
    }));

});
*/