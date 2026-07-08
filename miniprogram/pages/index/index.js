// pages/index/index.js
const {
  listActivities
} = require("../../services/activityService");

const {
  countParticipants
} = require("../../services/participantService");

const {
  listCheckins
} = require("../../services/checkinService");

const {
  calculateDashboard
} = require("../../utils/dashboard");

Page({

  /**
   * 页面初始数据
   */
  data: {
    activities: []
  },

  async onLoad() {

    const res = await listActivities();

    const activities = await Promise.all(

      res.data.map(async item => {
  
        const count = await countParticipants(item._id);
        const historyResult = await listCheckins(item._id);

        const history = historyResult.data;

        const dashboard =
          calculateDashboard(
              item,
              history
          );
        //console.log("dashboard.streak:", dashboard.streak);
        return {
  
            ...item,
  
            participantCount: count.total,
  
            ...dashboard
  
          };
  
      })
  
    );
    
    this.setData({    
        activities  
    });

  },


  /**
   * 创建活动
   */
  goToCreate() {
    wx.navigateTo({
      url: '/pages/create/index'
    })
  },

  /**
   * 加入活动
   */
  goToJoin() {
    wx.navigateTo({
      url: '/pages/join/index'
    })
  },

  /**
   * 显示活动
   */
  goToActivity(event) {
    const activityId = event.currentTarget.dataset.id;

    wx.navigateTo({
      url: `/pages/activity/index?id=${activityId}`
    });
    //console.log(activityId); // Output: activityid
  },

  /**
   * 打卡活动
   */
  handleCheckin(event) {

    const activityId = event.currentTarget.dataset.id;

    wx.navigateTo({
      url: `/pages/checkin/index?id=${activityId}`
    });
    //console.log(activityId); // Output: activityid
  }  


})