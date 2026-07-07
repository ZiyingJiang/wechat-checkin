/* miniprogram/services/checkinService.js */

const db = wx.cloud.database();
const checkins = db.collection("checkins");

/**
* 新增打卡
*/
async function createCheckin(checkin){ 

  return checkins.add({
    data: checkin
  });

}

/**
 * 提取打卡历史
 */
function listCheckins(activityId){
  return checkins.where({
    activityId: activityId
  })
  .orderBy("day", "desc")
  .get();
}

/**
 * 查询今天是否已经打卡
 */
function todayCheckin(activityId, day){

    return checkins.where({
      activityId: activityId,
      day: day
      //participantId: participantid
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



module.exports = {
  createCheckin,
  todayCheckin,
  updateCheckin,
  listCheckins
};