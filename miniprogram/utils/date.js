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

module.exports = {

  calculateCurrentDay

};