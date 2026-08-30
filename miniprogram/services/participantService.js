/* miniprogram/services/participantService.js */
const { getOpenId } = require("./userService");

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
async function addParticipant(participant) {
  // 1. 验证用户身份是否存在
  if (!participant.openId) {
    throw new Error("用户身份不存在");
  }

  // 2. 验证传入身份是否是当前用户
  const currentOpenId = await getOpenId();

  if (currentOpenId !== participant.openId) {
    throw new Error("当前用户身份验证失败");
  }
  // 3. 写入 participant
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