/* miniprogram/services/activityService.js */



const db = wx.cloud.database();
const activities = db.collection("activities");

/**
* 生成6位邀请码
*/
function generateJoinCode() {
    const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";

    let code = "";

    for (let i = 0; i < 6; i++) {
        code += chars.charAt(
            Math.floor(Math.random() * chars.length)
        );
    }

    return code;

}

/**
* 根据持续天数计算结束日期
*/
function calculateEndDate(days){
    const start = new Date();
    const end = new Date(start);
    end.setDate(start.getDate() + days - 1);
    return end;
}

/**
* 创建活动
*/
async function createActivity(activity, openId){
    const data = {
        ...activity,
        joinCode: generateJoinCode(),
        startDate: new Date(),
        endDate: calculateEndDate(activity.days),
        creatorOpenId: openId,
        maxParticipants:100
    };

    const result = await activities.add({
      data
  });

  return {
      _id: result._id,
      ...data
  };

}

/**
*  找到活动
*/
function findActivityByCode(joinCode){
  return activities.where({
    joinCode: joinCode.toUpperCase()
  }).get();
}


function listActivities() {
  return activities.get();
}

/**
*  读取活动
*/
function getActivityById(id) {
  return activities.where({
    _id: id
  }).get();
}


module.exports = {
  createActivity,
  findActivityByCode,
  listActivities,
  getActivityById
};