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
            title:"活动已经完成",
            icon:"none"
        });
        return;
      } 
      
      const activity = this.data.activity;

      //增加保护， 防御 activity = null
      if (!activity){
        return;
      }

      console.log("进入打卡页面：", activity._id);   
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
            return;
          }
          const activity = activityResult.data[0];

          //计算当前天数
          const currentDay = calculateCurrentDay(activity.startDate, activity.days);
          const isFinished = currentDay > activity.days;
                
          //读取打卡历史
          const checkinHistory = await listCheckins(activity._id);

          //把 values object转成array, 方便页面循环显示
          const history = checkinHistory.data.map(checkin=> {
            return{
              ...checkin,
              valueList: Object.entries(checkin.values)
            };
          });

          //计算完成度
          const checkedDays = history.length;
          const completionRate = 
            Math.min(
                100,
                Math.round(checkedDays / activity.days * 100)
            );

          //计算streak
          const {streak, hasCheckedToday} = calculateStreak(history, currentDay);
          console.log("hasCheckedToday", hasCheckedToday);
          //读取当天打卡状态
          //const todayRecord = history.find(item => item.day === currentDay);
          //const todayCheckinId = todayRecord ? todayRecord._id : null;

          //保存到页面数据
          this.setData({
            activityId: activityId,
            activity: activity,
            currentDay: currentDay,
            checkinHistory: history,      
            completionRate: completionRate,
            streak: streak,
            hasCheckedToday: hasCheckedToday,
            checkedDays:checkedDays,
            isFinished: isFinished,
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




