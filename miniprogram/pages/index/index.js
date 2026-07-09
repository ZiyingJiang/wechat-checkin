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
    activities: [],
    loading: true
  },

  async onLoad() {
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

          return {    
              ...item,    
              participantCount: count.total,    
              ...dashboard    
            };
    
        })
  
      );
    
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
        title: "加载失败",
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