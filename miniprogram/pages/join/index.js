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
    joinCode: "",
    submitting: false
  },

  onCodeInput(event) {

    this.setData({
      joinCode: event.detail.value.toUpperCase()
    });

  },

  async handleJoinActivity(){
    // 1. 防重复点击
    if (this.data.submitting) {
      return;
    }

    // 2. 输入校验
    if(!this.validateInput()){
      return;
    }

    // 3. 开始提交
    this.setData({
      submitting: true
    });

    wx.showLoading({
      title:"加入中"
    });

    try{
      const activity = await findActivityByCode(this.data.joinCode);

      if (activity.data.length === 0) {
        wx.showToast({
          title: "请输入有效邀请码",
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

    } catch (err){
      console.error(err);

      wx.showToast({
        title: "加载失败",
        icon: "none"
      })   
    } 
    finally{
      wx.hideLoading();

      this.setData({
        submitting: false
      });
    }
  },
  
  validateInput(){
    //校验邀请码,数据库不用白查一次
    const joinCode = this.data.joinCode.trim();

    if (!joinCode) {
      wx.showToast({    
          title:"请输入邀请码",    
          icon:"none"    
      });    
      return false;    
    } ;
    
    return true;
        
  }
  
})