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
    activityId: null,
    activity: null,
    values: {},
    note: "",
    checkinId: null,
    currentDay: 0,
    submitting: false,
    loading: true
  },
  
  async onLoad(options) {

    //直接从options中提取id 
    this.activityId = options.id;
    await this.loadCheckin();
  },

  async loadCheckin(){
    this.setData({
      loading: true
    });

    try{
      /**
      * 读取活动
      */
      const activityResult = await getActivityById(this.activityId);
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

      //写入数据，准备页面显示
      this.setData({    
        activity,
        currentDay: day
      });

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

      /**
      * 读取打卡
      */
      const checkin = await todayCheckin(activity._id, day);
      if (checkin.data.length > 0) {
        this.setData({
          values:checkin.data[0].values,
          checkinId: checkin.data[0]._id,
        }); 
        return;
      }

    } catch (err){

      console.error(err);

      wx.showToast({  
        title: "加载失败，请稍后重试",  
        icon: "none"  
      });
    }
    finally{

      this.setData({    
        loading: false  
      });

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
  },

  onNoteInput(event){

    this.setData({
        note:event.detail.value
    });

  },
  
  async handleSubmit(){    
    // 1. 防重复点击
    if(this.data.submitting){
      return;
    } 

    // 2. 输入校验
    if (!this.validateInput()) {
      return;
    }

    // 3. 开始提交
    this.setData({
      submitting: true
    });

    wx.showLoading({
      title:"提交中"
    });

    try{

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

        let message = "";

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
    const fields = this.data.activity.fields  || [];  

    /*如活动创建者未设任何指标，则无法打卡。
    *但是这不应该在打卡处拦截，而应在创建处干预
    *因为活动参与者无法干预这个设置

    if (fields.length === 0){

      wx.showToast({
          title:"活动未设置打卡指标",
          icon:"none"
      });

      return false;

     }*/

    const firstField = fields[0];
    const value = (values[firstField] || "").trim();

    if (!value) {
      wx.showToast({
        title: `请输入${firstField} `,
        icon: "none"
      }); 
      return false;
    }

    return true;    
  }

});

