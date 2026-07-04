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

function todayCheckin(){

}

function updateCheckin(){
  
}

module.exports = {
  createCheckin
};