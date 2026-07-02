// pages/index/index.js
const {
  listActivities
} = require("../../services/activityService");

const {
  calculateCurrentDay
} = require("../../utils/date");

const {
  countParticipants
} = require("../../services/participantService");

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
  
        return {
  
            ...item,
  
            participantCount: count.total,
  
            currentDay: calculateCurrentDay(
                item.startDate,
                item.days
            )
  
          };
  
      })
  
    );
    
    this.setData({    
        activities    
    });

    //console.log(res);

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
  }

})