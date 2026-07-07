//miniprogram/pages/activity/index.js
const {
  getActivityById
} = require("../../services/activityService");

const { 
  todayCheckin,
  listCheckins 
} = require("../../services/checkinService");

const {
  calculateCurrentDay
} = require("../../utils/date");

Page({

  data: {
    activity: null,
    currentDay: 0,    
    todayCheckinId: null,
    completionRate: 0,
    checkinHistory: []
  },
  
  async onLoad(options) {
    try{
      //直接从options中提取id 
      const activityId = options.id;

      /**
      * 读取活动
      */
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
      const day = calculateCurrentDay(activity.startDate, activity.days);

            
      /**
      * 读取打卡历史
      */
      const checkinHistory = await listCheckins(activity._id);

      //把 values object转成array, 方便页面循环显示
      const history = checkinHistory.data.map(checkin=> {
        return{
          ...checkin,
          valueList: Object.entries(checkin.values)
        };
      });

      //计算完成度
      const completionRate =  Math.round(history.length / activity.days * 100);

      //保存到页面数据
      this.setData({
        activity: activity,
        currentDay: day,
        checkinHistory: history,      
        completionRate
      });

      //读取当天打卡状态
      const todayCheckins = await todayCheckin(activity._id, day)
      if (todayCheckins.data.length > 0) {
        this.setData({        
          todayCheckinId: todayCheckins.data[0]._id
        }); 
      }
    }catch(err){

      console.error(err);

      wx.showToast({
          title:"加载失败",
          icon:"none"
      });

    }

  },

  /**
   * 前去打卡
   */
    handleCheckin(){
      const activity = this.data.activity;

      //增加保护， 防御 activity = null
      if (!activity){
        return;
      }

      console.log("进入打卡页面：", activity._id);   
      wx.navigateTo({
        url: `/pages/checkin/index?id=${activity._id}`
      });

    }  
    
});




