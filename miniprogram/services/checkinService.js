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


function listCheckins(){

}
/**
 * 查询今天是否已经打卡,看最新一条，未支持当日查询
 */
function todayCheckin(activityId, day){

    return checkins.where({
      activityId: activityId,
      day: day
      //participantId: participantid
    }).get();

}

function updateCheckin(){
  
}

module.exports = {
  createCheckin,
  todayCheckin
};