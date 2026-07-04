//miniprogram/pages/checkin/index.js
const {
  getActivityById
} = require("../../services/activityService");

const {
  createCheckin
} = require("../../services/checkinService");

const {
  calculateCurrentDay
} = require("../../utils/date");

Page({

  data: {
    activity: null,
    values: {},
    note: ""
  },
  
  async onLoad(options) {
    //直接从options中提取id 
    const activityId = options.id;

    /**
    * 读取活动
    */
    const activity = await getActivityById(activityId);
    if (activity.data.length === 0) {
      wx.showToast({
        title: "活动不存在",
        icon: "none"
      });
      return;
    }

    //保存到页面数据
    this.setData({
      activity: activity.data[0]
    });
  },

  /**
   * 
   * @param {*} event 
   */
  onValueInput(event){
    const values = {...this.data.values};
    const field = event.currentTarget.dataset.field;
    values[field] = event.detail.value;

    this.setData({
      values
    });  
    console.log(values);
  },
  
  async handleSubmit(){    
    const day = calculateCurrentDay(this.data.activity.startDate, this.data.activity.days);
    const checkin = {
      activityId: this.data.activity._id,
      participantId: "",
      date: new Date(),
      day: day,
      values: this.data.values,
      note: "",
      createdAt: new Date()
    };

    try{
        wx.showLoading({
          title:"提交中"
        });

        await createCheckin(checkin);

        wx.hideLoading();

        wx.showToast({
          title: "打卡成功",
        });

    }catch(err){
        wx.hideLoading();

        wx.showToast({
            title:"提交失败",
            icon:"none"
        });
    }
    
  }
 

});

