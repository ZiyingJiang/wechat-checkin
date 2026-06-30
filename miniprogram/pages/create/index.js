
const {
    createActivity
} = require("../../services/activityService");    

Page({
  /**
   * 页面输入数据
   */
  data: {
    title: "",
    days: 14,
    description: "",
    metrics: ["", "", ""]
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

    metrics[index] = event.detail.value;

    this.setData({
        metrics
    });
  },

  async handleCreateActivity(){

    if(!this.data.title.trim()){
  
      wx.showToast({
        title:"请输入活动名称",
        icon:"none"
      })
  
      return
    }
  
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
  
    wx.showLoading({
      title:"创建中"
    })
  
  
    try {

        const res = await createActivity(activity);
    
         wx.showToast({
            title: "创建成功",
            icon: "success"
        });
    
        console.log("created:", res);
    
    } catch (err) {
      
        console.error(err);
    
        wx.showToast({
            title: "创建失败",
            icon: "none"
        });
    
    } finally {
    
        wx.hideLoading();
    
    }
  
  
  }

})