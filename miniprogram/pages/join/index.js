//miniprogram/pages/join/index.js

const {
  findActivityByCode
} = require("../../services/activityService");

const {
  addParticipant,
  findParticipant
} = require("../../services/participantService");

Page({

  data: {
    joinCode: ""
  },

  onCodeInput(event) {

    this.setData({
      joinCode: event.detail.value.toUpperCase()
    });

  },

  async handleJoinActivity(){

    const activity = await findActivityByCode(this.data.joinCode);

    if (activity.data.length === 0) {
      wx.showToast({
        title: "邀请码不存在",
        icon: "none"
      });
      return;
    }

    const participant = {
      activityId: activity.data[0]._id,
      role: "member",
      openId: "",
      joinedAt: new Date()
    };

    const existed = await findParticipant(
      activity.data[0]._id,
      ""
    );

    if (existed.data.length > 0) {
      wx.showToast({
          title: "已经加入过该活动",
          icon: "none"
      });
      return;
    }

    await addParticipant(participant);

    wx.showToast({
      title:"加入成功",
      icon:"success"
    });
    console.log("找到活动：", activity.data[0]);

}

});