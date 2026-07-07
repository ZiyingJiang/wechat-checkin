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

function calculateStreak(history, currentDay){
  let streak = 0;
  let targetDay = currentDay;
  const daySet = new Set(history.map(item => item.day));
  
  //如果今天没打卡，就从昨天开始计算。
  console.log(daySet, "targetDay:", targetDay);
  if (!daySet.has(currentDay)) {
    targetDay = currentDay - 1;
  }
  while (daySet.has(targetDay)){
    console.log("find the targetDay record");
    streak ++;
    targetDay -- 
  }
  console.log("streak:", streak);
  console.log("checkedToday:", daySet.has(currentDay));
  return {
    streak,
    hasCheckedToday: daySet.has(currentDay)
  }
}

module.exports = {

  calculateCurrentDay,
  calculateStreak

};