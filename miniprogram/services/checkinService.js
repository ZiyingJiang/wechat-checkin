/* miniprogram/services/checkinService.js */

const { findParticipant } = require("./participantService");
const { getActivityById } = require("./activityService");
const { getOpenId } = require("./userService");

// ===== Imports =====
const db = wx.cloud.database();
const checkins = db.collection("checkins");
const _ = db.command;

// ===== Public Functions =====
/** 新增打卡 */
async function createCheckin(checkin, openId){
  // 1. 检查用户身份
  if (!openId) {
    throw new Error("用户身份不存在");
  }
  const currentOpenId = await getOpenId();
  if (currentOpenId !== openId) {
    throw new Error("当前用户身份不能打卡");
  }

  // 2. 检查 Activity
  const activityResult = await getActivityById(checkin.activityId);
  if (activityResult.data.length ===0){
    throw new Error("活动不存在");
  }
  const activity = activityResult.data[0];

  // 3. 检查是否参加了该活动
  let isParticipant = false;
  const isCreator = activity.creatorOpenId === openId;
  if (!isCreator){
    const participantResult = await findParticipant(
      checkin.activityId,
      openId
    );
    isParticipant = participantResult.data.length > 0;
  }

  if (!isCreator && !isParticipant) {
    throw new Error ("无权参加此活动");
  }

  // 4. 防止重复打卡
  const existed = await todayCheckin(
    checkin.activityId,
    checkin.day,
    openId
  );

  if (existed.data.length > 0){
    throw new Error("今天已经打过卡");
  }

  // 5.Service 决定真正写入的身份
  const data = {
    ...checkin,
    openId: openId
  };

  // 6. 写入
  return checkins.add({
    data
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

async function updateCheckin(checkinId, values, note, openId) {
  // 1. 验证当前用户身份
  if (!openId) {
    throw new Error("用户身份不存在");
  }
  const currentOpenId = await getOpenId();
  if (currentOpenId !== openId) {
    throw new Error("当前用户身份不能修改此打卡");
  }

  // 2. 查询打卡记录
  let checkin;
  try{
    const checkinResult = await checkins.doc(checkinId).get();

    if (!checkinResult.data){
      throw new Error("打卡记录不存在");
    }
    checkin = checkinResult.data;

  } catch (err) {
    // 如果是我们自己抛出的错误，直接继续传递
    if (err.message === "打卡记录不存在") {
      throw err;
    }
    console.error("读取打卡记录失败:", err);
    throw new Error("打卡记录不存在");
  }

  // 3. 验证打卡记录属于当前用户
  if (checkin.openId !== openId){
    throw new Error("无权修改此打卡");
  }

  // 4. 修改
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