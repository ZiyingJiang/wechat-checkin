const db = wx.cloud.database();
const activities = db.collection("activities");

/**
 * 创建活动
 * @param {Object} activity
 * @returns {Promise}
 */
function createActivity(activity) {
  return activities.add({
    data: activity
  });
}

module.exports = {
  createActivity
};