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
 * 统计活动人数
 */
function countParticipants(activityId) {

  return participants
      .where({
          activityId
      })
      .count();

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
    countParticipants,
    findParticipant
};