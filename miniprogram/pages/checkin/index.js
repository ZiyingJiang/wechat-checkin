//miniprogram/pages/checkin/index.js
const {
  getActivityById
} = require("../../services/activityService");

const {
  createCheckin,
  todayCheckin,
  updateCheckin
} = require("../../services/checkinService");

const {
  calculateCurrentDay
} = require("../../utils/date");

Page({

  data: {
    activity: null,
    values: {},
    note: "",
    checkinId: null,
    currentDay: 0
  },
  
  async onLoad(options) {
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

    //保存到页面数据
    this.setData({
      activity: activity,
      currentDay: day
    });

    /**
    * 读取打卡
    */
    const checkin = await todayCheckin(activity._id, day);
    if (checkin.data.length > 0) {
      this.setData({
        values:checkin.data[0].values,
        checkinId: checkin.data[0]._id
      }); 
      console.log(this.data.values);
      console.log(this.data.checkinId);
      return;
    }
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
   //console.log(values);
  },

  onNoteInput(event){

    this.setData({
        note:event.detail.value
    });

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
    console.log(this.data.checkinId);
    console.log(checkin);

    let message = "";

    try{
        wx.showLoading({
          title:"提交中"
        });

        if (this.data.checkinId) {
          await updateCheckin(
            this.data.checkinId, 
            this.data.values, 
            this.data.note
          ); 

          message =   "打卡已更新";
   
        }
        else {      
          const result = await createCheckin(checkin);
          this.setData({
            checkinId: result._id
          })
          console.log("已分配checkinId:", this.data.checkinId);

          message =  "打卡成功";

        }

        wx.hideLoading();
        
        wx.showToast({
          title: message,
          icon: "success"
        }); 

    }catch(err){
      console.error(err);
      
      wx.hideLoading();

        wx.showToast({
            title:"提交失败",
            icon:"none"
        });
    }
    
  } 

});

