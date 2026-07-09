//miniprogram/pages/create/index.js
const {
    createActivity
} = require("../../services/activityService");    

const {
  addParticipant
} = require("../../services/participantService");

Page({
  /**
   * 页面输入数据
   */
  data: {
    title: "",
    days: 14,
    description: "",
    metrics: ["", "", ""],
    created: false,
    createdJoinCode: "",
    submitting: false
  },

  onLoad() {
  },

  /**
   * 活动名称输入
   */
  onTitleInput(event){
    this.setData({
        title: event.detail.value
      });
  },

  /**
   * 活动日期输入
   */
  onDaysInput(event){
    this.setData({
        days:Number(event.detail.value)
    });
  },
  
  /**
   * 活动介绍输入
   */  
  onDescriptionInput(event){
    this.setData({
        description:event.detail.value
    });
  },

  /**
   * 活动记录指标输入
   */
  onMetricInput(event){
   
    const index = event.currentTarget.dataset.index;
    const metrics = [...this.data.metrics];

    metrics[index] = event.detail.value.trim();
    
    this.setData({
      metrics
    });

  },

  async handleCreateActivity(){

    //1. 防重复点击 
    if (this.data.submitting) {
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
      title:"创建中"
    })

    try {
      const activity={  
        title: this.data.title,  
        description: this.data.description,  
        days: this.data.days,  
        fields: this.data.metrics.filter(
          item => item.trim() !== ""
        ),
        status: "running",
        createdAt: new Date()
      }

      const res = await createActivity(activity);
      // 自动把创建者加入活动
      await addParticipant({
        activityId: res._id,
        openId: "",
        nickname: "",
        avatar: "",
        role: "creator",
        joinedAt: new Date()
      });

      wx.showToast({
          title: "创建成功",
          icon: "success"
      });

      this.setData({
        created: true,
        createdJoinCode: res.joinCode
      });
      
    
    } catch (err) {
      
        console.error(err);
    
        wx.showToast({
            title: "创建失败",
            icon: "none"
        });
    
    } finally {
        wx.hideLoading();  

        this.setData({
          submitting: false
        });
    
    }
    
  },
  
  validateInput(){
    
    //确认活动名称非空
    const title = (this.data.title || "").trim();

    if(title===""){      
      wx.showToast({
        title:"请输入活动名称",
        icon:"none"
      });  
      return false;
    }

    //校验限制1~100 天
    const days = Number(this.data.days);

    if (days < 1 || days > 100) {
       wx.showToast({
           title: "活动天数请输入 1~100",
           icon: "none"
       });
       return false;
    }

    //确认第一项打卡指标非空
    const fields = this.data.metrics;  
    const requiredField = (fields[0] || "").trim();
    if (requiredField === "") {
      wx.showToast({  
          title: "请输入必填打卡指标",  
          icon: "none"  
      });
      return false;  
    }   
    return true;    
  },

  copyCode(){
    wx.setClipboardData({
        data:this.data.createdJoinCode
    });
  },

  backHome(){
    wx.navigateBack();
  }

})