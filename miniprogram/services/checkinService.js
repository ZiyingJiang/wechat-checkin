/* miniprogram/services/checkinService.js */
// ===== Imports =====
const db = wx.cloud.database();
const checkins = db.collection("checkins");
const _ = db.command;

// ===== Public Functions =====
/** 新增打卡 */
async function createCheckin(checkin){ 

  return checkins.add({
    data: checkin
  });

}

/** 提取打卡历史 */
function listCheckins(activityId, openId){
  return checkins.where({
    activityId,
    openId
  })
  .orderBy("day", "desc")
  .get();
}

/** 提取所有打卡历史 */
function listCheckinsByActivities(activityIds, openId){
  return checkins.where({
    activityId: _.in(activityIds),
    openId
  })
  .get();
}

/** 查询今天是否已经打卡 */
function todayCheckin(activityId, day, openId){

    return checkins.where({
      activityId,
      day,
      openId
    }).get();

}

async function updateCheckin(checkinId, values, note) {

  return checkins.doc(checkinId).update({
    data: {
      values,
      note
    }
  });

}


// ===== Exports =====
module.exports = {
  createCheckin,
  todayCheckin,
  updateCheckin,
  listCheckins,
  listCheckinsByActivities
};