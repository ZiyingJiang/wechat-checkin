//miniprogram/pages/activity/index.js
const {
  getOpenId
} = require("../../services/userService");

const {
  getActivityById, 
  updateActivity,
  deleteActivity
} = require("../../services/activityService");

const { 
  listCheckins 
} = require("../../services/checkinService");

const {
  calculateDashboard
} = require("../../utils/dashboard");

Page({

  data: {
    activityId: null,
    activity: null,
    isCreator: false,
    currentDay: 0,    
    isFinished: false,
    completionRate: 0,
    streak: 0,
    hasCheckedToday: null,
    checkinHistory: [],
    checkedDays: 0,
    loading: true,
    isEditing: false,
    editValues: {
      title: "",
      description: ""
    },
    saving: false,
    deleting: false
  },
  
  async onLoad(options) {
    
    //直接从options中提取id 
    this.setData({
      activityId: options.id 
    })
    //await this.testDeleteActivity();
  },

  async onShow() {
    if (!this.data.activityId) {
      return;
    }

    await this.loadActivity(this.data.activityId);
  },
  //测试用
  /*
  async testDeleteActivity() {

    try {
  
      const openId = await getOpenId();
      console.log("Delete Activity:","ea09778f6a504f72001504767bf718ef");
      const result = await deleteActivity(
        "ea09778f6a504f72001504767bf718ef",
        openId
      );
  
      console.log("delete result:", result);
  
    } catch (err) {
  
      console.error("delete failed:", err);
  
    }
  
  },
  */
  //点击编辑
  startEdit() {
    const activity = this.data.activity;
  
    if (!activity) {
      return;
    }
  
    this.setData({
      isEditing: true,
      editValues: {
        title: activity.title,
        description: activity.description
      }
    });
  },

  //取消编辑
  cancelEdit() {
    this.setData({
      isEditing: false,
      editValues: {
        title: "",
        description: ""
      }
    });
  },

  //保存编辑
  async saveEdit() {

    if (this.data.saving) {
      return;
    }
  
    const title = this.data.editValues.title.trim();
    const description = this.data.editValues.description.trim();
  
    if (!title) {
      wx.showToast({
        title: "活动名称不能为空",
        icon: "none"
      });
      return;
    }
  
    this.setData({
      saving: true
    });
  
    try {  
      const openId = await getOpenId();
  
      await updateActivity(
        this.data.activityId,
        openId,
        {
          title,
          description
        }
      );
    } catch (err) {
  
      console.error("保存活动失败:", err);
  
      this.setData({
        saving: false
      });
  
      wx.showToast({
        title: "保存失败，请稍后重试",
        icon: "none"
      });

      return;
    }

    this.setData({
      isEditing: false,
      saving: false
    });

    wx.showToast({
      title: "保存成功",
      icon: "success"
    });
  
    //重新读取活动，确保页面显示数据库中的最新数据
    await this.loadActivity(this.data.activityId);  
    
  },

  //读取修改值
  onEditTitle(event) {
    this.setData({
      "editValues.title": event.detail.value
    });
  },
  
  onEditDescription(event) {
    this.setData({
      "editValues.description": event.detail.value
    });
  },

  // 删除活动
  async handleDelete() {

    if (this.data.deleting) {
      return;
    }

    const activity = this.data.activity;

    if (!activity) {
      return;
    }

    const result = await wx.showModal({
      title: "删除活动",
      content: "确定要删除这个活动吗？删除后活动、参与者和打卡记录都无法恢复。",
      confirmText: "删除",
      cancelText: "取消"
    });

    if (!result.confirm) {
      return;
    }

    this.setData({
      deleting: true
    });

    try {

      const openId = await getOpenId();

      await deleteActivity(
        this.data.activityId,
        openId
      );

      this.setData({
        deleting: false
      });
      
      wx.showToast({
        title: "删除成功",
        icon: "success"
      });

      // 稍后返回首页
      setTimeout(() => {
        /*wx.redirectTo({
          url: "/pages/index/index"
        });*/
        wx.navigateBack(); 
      }, 500);

    } catch (err) {

      console.error("删除活动失败:", err);

      this.setData({
        deleting: false
      });

      wx.showToast({
        title: err.message || "删除失败，请稍后重试",
        icon: "none"
      });
    }
  },

  //前去打卡
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
    
    // 清除上一个 Activity 的页面状态
    this.setData({
      loading: true,
      activity: null,
      isCreator: false,
      isEditing: false,
      editValues: {
        title: "",
        description: ""
      },
      saving: false,
      deleting: false,
      checkinHistory: [],
      currentDay: 0,
      isFinished: false,
      completionRate: 0,
      streak: 0,
      hasCheckedToday: null,
      checkedDays: 0
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
        const openId = await getOpenId();   
        const isCreator = activity.creatorOpenId === openId; 
        //读取打卡历史
        const checkinHistory = await listCheckins(activity._id, openId);

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
          isCreator,
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




