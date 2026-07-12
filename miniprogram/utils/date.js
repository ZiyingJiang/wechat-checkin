//miniprogram/utlis/date.js
/**
 * 计算今天是第几天
 */

function calculateCurrentDay(startDate,totalDays) {

  const start = new Date(startDate);
  const today = new Date();

  const startDay = new Date(
    start.getFullYear(),
    start.getMonth(),
    start.getDate()
  );

  const todayDay = new Date(
    today.getFullYear(),
    today.getMonth(),
    today.getDate()
  );

  const diff = todayDay - startDay;

  let day = Math.floor(diff / (1000 * 60 * 60 * 24)) + 1;

  if (day < 1) day = 1;

  if (day > totalDays) day = totalDays;

  return day;

}

//计算活动是否完结
function isActivityFinished(endDate) {

  const today = new Date();

  const end = new Date(endDate);

  const todayOnly = new Date(
      today.getFullYear(),
      today.getMonth(),
      today.getDate()
  );

  const endOnly = new Date(
      end.getFullYear(),
      end.getMonth(),
      end.getDate()
  );

  return todayOnly > endOnly;
}


function calculateStreak(history, currentDay){
  let streak = 0;
  let targetDay = currentDay;
  const daySet = new Set(history.map(item => item.day));
  
  //如果今天没打卡，就从昨天开始计算。
  if (!daySet.has(currentDay)) {
    targetDay = currentDay - 1;
  }
  while (daySet.has(targetDay)){
    streak ++;
    targetDay -- 
  }

  return {
    streak,
    hasCheckedToday: daySet.has(currentDay)
  }
}

module.exports = {

  calculateCurrentDay,
  isActivityFinished,
  calculateStreak

};