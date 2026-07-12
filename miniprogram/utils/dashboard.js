const {
  calculateCurrentDay,
  isActivityFinished,
  calculateStreak
} = require("./date");

/**
 * 计算 Activity Dashboard 所需数据
 */

function calculateDashboard(activity, history){

  //计算当前天数
  const currentDay =
    calculateCurrentDay(
        activity.startDate,
        activity.days
    );

  //计数已打卡天数
  const checkedDays = history.length; 

  //计算完成度
  const completionRate =
    Math.round(
        checkedDays /
        activity.days *
        100
    );

  //计算streak
  const {
      streak,
      hasCheckedToday
  } =
  calculateStreak(
      history,
      currentDay
  );
  
  //活动结束与否
  const isFinished = isActivityFinished(activity.endDate);
  return {

      currentDay,
      checkedDays,
      streak,
      hasCheckedToday,
      completionRate,
      isFinished

  };

}

module.exports = {
  calculateDashboard
};