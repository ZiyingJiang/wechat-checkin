/* miniprogram/services/participantService.js */
// ===== Imports =====
const db = wx.cloud.database();
const participants = db.collection("participants");
const _ = db.command;

/**
 * 添加活动参与者
 * @param {Object} participant
 * @returns {Promise}
 */

// ===== Public Functions =====
function addParticipant(participant) {
    return participants.add({
        data: participant
    });
}

/** 统计活动人数 */
function countParticipants(activityId) {

  return participants
      .where({
          activityId
      })
      .count();

}

/** 查询是否已经加入活动 */
function findParticipant(activityId, openId) {
  return participants.where({
      activityId,
      openId
  }).get();
}

/** 查询加入的活动 */
function listParticipantsByOpenId(openId) {
  return participants.where({
      openId
  }).get();
}

/** 查询多项活动全部参加者 */
function listParticipantsByActivities(activityIds) {
  return participants.where({
    activityId: _.in(activityIds)
  }).get();
}

// ===== Exports =====
module.exports = {
    addParticipant,
    countParticipants,
    findParticipant,
    listParticipantsByOpenId,
    listParticipantsByActivities
};