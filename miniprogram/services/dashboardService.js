/*miniprogram/services/dashboardService.js*/
// ===== Imports =====
const {
  listActivitiesByIds
} = require("./activityService");

const {
  listParticipantsByOpenId,
  listParticipantsByActivities
} = require("./participantService");

const{
  listCheckinsByActivities
} = require("./checkinService");

const {
  calculateDashboard
} = require("../utils/dashboard");

// ===== Public Functions =====
async function getDashboardActivities(openId) {
  const participantActivitiesResult = await listParticipantsByOpenId(openId);
  
  const activityIds = participantActivitiesResult.data.map(item => item.activityId);

  if (activityIds.length === 0) {
    return [];
  }

  const activitiesResult = await listActivitiesByIds(activityIds)

  const allParticipantsResult = await listParticipantsByActivities(activityIds);       
  const participantCountMap = buildParticipantCountMap(allParticipantsResult.data);
 
  const allCheckinsResult = await listCheckinsByActivities(activityIds, openId);
  const checkinHistoryMap = buildCheckinHistoryMap(allCheckinsResult.data);

  const dashboardActivities = activitiesResult.data.map(activity => {
    // ① 找到这个 activity 对应的 checkin history
    const history = checkinHistoryMap[activity._id] || [];
    // ② 调用 calculateDashboard()
    const dashboard = calculateDashboard(activity, history);
    // ③ 返回 activity + participantCount + dashboard
    return{
      ...activity, 
      participantCount: participantCountMap[activity._id] || 0 ,
      ...dashboard, 
    }     
  });

  return dashboardActivities;

}

// ===== Private Helper Functions =====
/* 计数多个参加者其各活动的总参加人数 */
function buildParticipantCountMap(participants) {

  const participantCountMap = {};

  for (const participant of participants) {

    const activityId = participant.activityId;

    if (participantCountMap[activityId]) {
      participantCountMap[activityId]++;
    } else {
      participantCountMap[activityId] = 1;
    }

  }

  return participantCountMap;

}

/* 按 activityId 将打卡记录分组 */
function buildCheckinHistoryMap(checkins) {

  const checkinHistoryMap = {};

  for (const checkin of checkins) {

    const activityId = checkin.activityId;

    if (checkinHistoryMap[activityId]) {
      checkinHistoryMap[activityId].push(checkin);
    } else {
      checkinHistoryMap[activityId] = [checkin];
    }

  }

  return checkinHistoryMap;

}

// ===== Exports =====
module.exports = {
  getDashboardActivities
};