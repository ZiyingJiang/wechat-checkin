/*miniprogram/services/dashboardService.js*/
// ===== Imports =====
const {
  listActivitiesByIds
} = require("./activityService");

const {
  listParticipantsByOpenId,
  listParticipantsByActivities
} = require("./participantService");

// ===== Public Functions =====
async function getDashboardActivities(openId) {
  const participantActivitiesResult = await listParticipantsByOpenId(openId);
  console.log("participantActivitiesResult:",participantActivitiesResult );
  const activityIds = participantActivitiesResult.data.map(item => item.activityId);

  if (activityIds.length === 0) {
    return [];
  }

  const activitiesResult = await listActivitiesByIds(activityIds)

  const allParticipantsResult = await listParticipantsByActivities(activityIds);       
  const participantCountMap = buildParticipantCountMap(allParticipantsResult.data);

  const dashboardActivities = activitiesResult.data.map(activity => ({
        ...activity,  
        participantCount: participantCountMap[activity._id] || 0  
    }));
  
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

// ===== Exports =====
module.exports = {
  getDashboardActivities
};