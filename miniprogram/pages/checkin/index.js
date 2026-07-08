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
    currentDay: 0,
    submitting: false
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

    //增强保护，活动结束后，不能再check in
    if(day > activity.days){

      wx.showToast({
          title:"活动已经结束",
          icon:"none"
      });
  
      setTimeout(()=>{
          wx.navigateBack();
      },1000);
  
      return;
    }

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
      //console.log(this.data.values);
      //console.log(this.data.checkinId);
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
    values[field] = (event.detail.value).trim();

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
    
    if(this.data.submitting){
      return;
    } 

    if (!this.validateInput()) {
      return;
    }

    const day = calculateCurrentDay(this.data.activity.startDate, this.data.activity.days);
    const checkin = {
      activityId: this.data.activity._id,
      participantId: "",
      date: new Date(),
      day: day,
      values: {...this.data.values},
      note: this.data.note,
      createdAt: new Date()
    };
    //console.log(this.data.checkinId);
    //console.log(checkin);

    let message = "";

    this.setData({
      submitting: true
    });

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
       
        wx.showToast({
          title: message,
          icon: "success",
          duration: 1200
        }); 

        setTimeout(() => {
          wx.navigateBack();  
        }, 1200);

    }catch(err){
      console.error(err);     

        wx.showToast({
            title:"提交失败",
            icon:"none",
            duration: 1200
        });
    }
    finally{
      
      wx.hideLoading();
      this.setData({
        submitting: false
      });
    }

  },

  validateInput(){
    const values= this.data.values;
    const fields = this.data.activity.fields;  
    for(const field of fields){
      const fieldvalue = (values[field] || "").trim();
      if (fieldvalue === "") {
        wx.showToast({
          title: `请输入 ${field}`,
          icon: "none"
        }); 
        return false;
      }
    }
    return true;    
  }

});

