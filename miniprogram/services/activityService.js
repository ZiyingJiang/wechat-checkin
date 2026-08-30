/* miniprogram/services/activityService.js */
const { getOpenId } = require("./userService");

// ===== Imports =====
const db = wx.cloud.database();
const activities = db.collection("activities");
const participants = db.collection("participants");
const checkins = db.collection("checkins");
const _ = db.command;

// ===== Public Functions =====
/** 创建活动 */
async function createActivity(activity, openId){
  // 1. 验证当前用户身份
  if (!openId) {
    throw new Error("用户身份不存在");
  }

  const currentOpenId = await getOpenId();

  if (currentOpenId !== openId) {
    throw new Error("当前用户身份验证失败");
  }
  // 2. 创建 Activity
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
  // 1. 验证当前用户身份
  const currentOpenId = await getOpenId();
  if (!openId || currentOpenId !== openId) {
    throw new Error("用户身份验证失败");
  }
  // 2. 验证活动
  const activityResult = await getActivityById(activityId);
  if (activityResult.data.length === 0) {
    throw new Error("活动不存在");
  }
  // 3. 验证创建者身份
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

/**删除活动 （创建者）*/
async function deleteActivity(activityId, openId){
  // 1. 验证当前用户身份
  const currentOpenId = await getOpenId();
  if (!openId || currentOpenId !== openId) {
    throw new Error("用户身份验证失败");
  }

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

/**退出活动（参与者） */
async function leaveActivity(activityId, openId){

  // 1. 检查活动是否存在
  const activityResult = await getActivityById(activityId);

  if (activityResult.data.length === 0) {
    throw new Error("活动不存在");
  }

  const activity = activityResult.data[0];

   // 2. 验证当前用户身份
   const currentOpenId = await getOpenId();

   if (!openId || currentOpenId !== openId) {
     throw new Error("用户身份验证失败");
   }

  // 3. Creator 不能退出
  if (activity.creatorOpenId === openId) {
    throw new Error("创建者不能退出活动");
  }

  // 4. 确认用户确实参加了这个活动
  const participantResult = await participants.where({
    activityId,
    openId
  }).get();

  if (participantResult.data.length === 0) {
    throw new Error("你尚未加入此活动");
  }

  // 5. 删除自己的 checkins
  await checkins.where({
    activityId,
    openId
  }).remove();

  // 6. 删除自己的 participant record
  await participants.where({
    activityId,
    openId
  }).remove();

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
  leaveActivity,
  findActivityByCode,
  listActivities,
  getActivityById,
  listActivitiesByIds
};