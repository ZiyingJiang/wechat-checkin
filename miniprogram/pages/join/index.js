//miniprogram/pages/join/index.js
const {
  getOpenId
} = require("../../services/userService");

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

    try{
      // 3.查询活动
      const activityResult = await findActivityByCode(this.data.joinCode);

      if (activityResult.data.length === 0) {
        wx.showToast({
          title: "邀请码不存在",
          icon: "none",
          duration: 2000
        });
        return;
      }

      const activity = activityResult.data[0];

      // 4.检查活动是否结束
      if (new Date() > new Date(activity.endDate)){
        wx.showToast({
          title: "活动已结束，无法加入",
          icon: "none",
          duration: 2000
        });
        return;
      }

      // 5. 开始提交
      this.setData({
        submitting: true
      });
  
      wx.showLoading({
        title:"加入中"
      });

      // 6. 获取当前用户
      const openId =await getOpenId();
      const participant = {
        activityId: activity._id,
        role: "member",
        openId: openId,
        joinedAt: new Date()
      };

      // 7. 检查是否已经加入
      const existed = await findParticipant(
        activity._id,
        openId
      );
      
      if (existed.data.length > 0) {

        wx.hideLoading();

        wx.showToast({
            title: "已经加入过该活动",
            icon: "none",
            duration: 2000
        });
        return;
      }

      // 8. 添加 participant
      await addParticipant(participant);
  
      wx.hideLoading();

      wx.showToast({
        title:"加入成功",
        icon:"success",
        duration: 1200
      }); 

      setTimeout(() => {
        wx.navigateBack();  
      }, 1200);

    } catch (err){
      console.error(err);
      wx.hideLoading();
      wx.showToast({
        title: "加载失败，请稍后重试",
        icon: "none"
      })   
    } 
    finally{

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