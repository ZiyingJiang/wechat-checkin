const db = wx.cloud.database();
const participants = db.collection("participants");

/**
 * 添加活动参与者
 * @param {Object} participant
 * @returns {Promise}
 */
function addParticipant(participant) {
    return participants.add({
        data: participant
    });
}

/**
 * 查询是否已经加入活动
 */
function findParticipant(activityId, openId) {
  return participants.where({
      activityId,
      openId
  }).get();
}

module.exports = {
    addParticipant,
    findParticipant
};