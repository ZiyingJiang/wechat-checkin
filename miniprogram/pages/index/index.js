// pages/index/index.js
const {
  getOpenId
} = require("../../services/userService");

const {
  getDashboardActivities
} = require("../../services/dashboardService");


Page({

  /**
   * 页面初始数据
   */
  data: {
    activities: [],
    loading: true
  },

  async onLoad() {
    wx.cloud.callFunction({
      name: "login"
    }).then(res => {
      console.log("Login Result:", res.result);
    }).catch(err => {
      console.error(err);
    });
    
    await this.loadActivities();  
  },

  async onShow() {
    await this.loadActivities();  
  }, 
  
  async loadActivities() {
    this.setData({
      loading: true
    });

    try{
      
      const openId = await getOpenId();
      
      const activities = await getDashboardActivities(openId);
    
      this.setData({    
          activities,
          loading: false  
      });

    } catch (err){
      console.error(err);

      this.setData({
        loading: false
      });

      wx.showToast({
        title: "加载失败，请稍后重试",
        icon: "none"
      });
    }
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
 
  },

  /**
   * 打卡活动
   */
  handleCheckin(event) {

    const activityId = event.currentTarget.dataset.id;

    wx.navigateTo({
      url: `/pages/checkin/index?id=${activityId}`
    });

  }  


})