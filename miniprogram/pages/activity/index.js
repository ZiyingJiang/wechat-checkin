//miniprogram/pages/activity/index.js
const {
  getActivityById
} = require("../../services/activityService");

const { 
  todayCheckin,
  listCheckins 
} = require("../../services/checkinService");

const {
  calculateCurrentDay,
  calculateStreak
} = require("../../utils/date");

const {
  calculateDashboard
} = require("../../utils/dashboard");

Page({

  data: {
    activityId: null,
    activity: null,
    currentDay: 0,    
    isFinished: false,
    completionRate: 0,
    streak: 0,
    hasCheckedToday: null,
    checkinHistory: [],
    checkedDays: 0,
    loading: true
  },
  
  async onLoad(options) {
    
    //直接从options中提取id 
    this.setData({
      activityId: options.id 
    })

  },

  async onShow() {
    if (!this.data.activityId) {
      return;
    }

    await this.loadActivity(this.data.activityId);
  },

  /**
   * 前去打卡
   */
    handleCheckin(){
      
      //如活动完成，不能进入checkin页面
      if(this.data.isFinished){
        wx.showToast({
            title:"活动已完结",
            icon:"none"
        });
        return;
      } 
      
      const activity = this.data.activity;

      //增加保护， 防御 activity = null
      if (!activity){
        return;
      }

      wx.navigateTo({
        url: `/pages/checkin/index?id=${activity._id}`
      });

    }, 

    async loadActivity(activityId){
      
      this.setData({
        loading: true
      }); 
      
      try{
          
          //读取活动 
          const activityResult = await getActivityById(activityId);
          if (activityResult.data.length === 0) {
            wx.showToast({
              title: "活动不存在",
              icon: "none"
            });
            
            this.setData({
              loading: false
            }); 

            return;
          }
          const activity = activityResult.data[0];
               
          //读取打卡历史
          const checkinHistory = await listCheckins(activity._id);

          //把 values object转成array, 方便页面循环显示。指标及数值遵循数据库顺序而不是输入顺序
          const history = checkinHistory.data.map(checkin=> {
            const valueList = activity.fields.map(field => {
              return {
                  label: field,      
                  value: checkin.values[field] || ""      
              };      
            });
            return{
              ...checkin,
              valueList
            };
          });

          const dashboard = 
            calculateDashboard(
              activity,
              history
            );

          //保存到页面数据
          this.setData({
            activityId: activityId,
            activity: activity,
            checkinHistory: history,      
            ...dashboard,
            loading: false
          });
      }catch(err){

          console.error(err);
          this.setData({
            loading:false
          });
          wx.showToast({
              title:"加载失败",
              icon:"none"
          });

      }
  
    }
    
});




