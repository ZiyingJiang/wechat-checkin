/* miniprogram/services/activityService.js */
// ===== Imports =====
const db = wx.cloud.database();
const activities = db.collection("activities");
const participants = db.collection("participants");
const checkins = db.collection("checkins");
const _ = db.command;

// ===== Public Functions =====
/** 创建活动 */
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

/** 修改活动名称和描述 */
async function updateActivity(activityId, openId, values){
  const activityResult = await getActivityById(activityId);
  if (activityResult.data.length === 0) {
    throw new Error("活动不存在");
  }
  const activity = activityResult.data[0];
  const isCreator = activity.creatorOpenId === openId;
  if (!isCreator){
    throw new Error("无权修改此活动");
  }
  await activities.doc(activityId).update({
    data:{
      title:values.title,
      description: values.description
    }
  });

  return true;
}

/**删除活动 */
async function deleteActivity(activityId, openId){
  // ① 读取活动
  const activityResult = await getActivityById(activityId);

  // ② 检查活动是否存在
  if (activityResult.data.length === 0) {
    throw new Error("活动不存在");
  }
  const activity = activityResult.data[0];

  // ③ 检查是否为创建者
  const isCreator = activity.creatorOpenId === openId;
  if (!isCreator){
    throw new Error("无权删除此活动");
  }
  
  // ④ 删除参与者
  await participants.where({activityId}).remove();

  // ⑤ 删除打卡记录
  await checkins.where({activityId}).remove();

  // ⑥ 最后删除活动本身
  await activities.doc(activityId).remove();

  return true;
}


/** 找到活动 */
function findActivityByCode(joinCode){
  return activities.where({
    joinCode: joinCode.toUpperCase()
  }).get();
}


function listActivities() {
  return activities.get();
}

/** 读取活动 */
function getActivityById(id) {
  return activities.where({
    _id: id
  }).get();
}

/** 读取多个活动 */
function listActivitiesByIds(activityIds) {
  return activities.where({
    _id: _.in(activityIds)
  }).get();
}

// ===== Private Helper Functions =====
/** 生成6位邀请码*/
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

/** 根据持续天数计算结束日期 */
function calculateEndDate(days){
  const start = new Date();
  const end = new Date(start);
  end.setDate(start.getDate() + days - 1);
  return end;
}


// ===== Exports =====
module.exports = {
  createActivity,
  updateActivity,
  deleteActivity,
  findActivityByCode,
  listActivities,
  getActivityById,
  listActivitiesByIds
};