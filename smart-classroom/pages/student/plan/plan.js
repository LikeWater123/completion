// pages/student/plan/plan.js
Page({
  data: {
    learningPlan: null,
    loading: false
  },

  onLoad() {
    // 检查是否已有学习方案
    this.checkExistingPlan()
  },

  // 检查是否已有学习方案
  checkExistingPlan() {
    // 后续可以从云数据库获取已有的学习方案
    // wx.cloud.callFunction({
    //   name: 'ai-service',
    //   data: {
    //     action: 'getPlan'
    //   },
    //   success: (res) => {
    //     if (res.result.plan) {
    //       this.setData({
    //         learningPlan: res.result.plan
    //       })
    //     }
    //   }
    // })
  },

  // 生成学习方案
  generatePlan() {
    this.setData({ loading: true })
    
    // 模拟AI生成学习方案
    setTimeout(() => {
      this.setData({
        loading: false,
        learningPlan: {
          assessment: '你的学习基础较好，掌握了大部分知识点，但在二次函数和几何证明方面还有提升空间。建议重点加强这两个板块的练习。',
          weakPoints: ['二次函数', '几何证明', '三角函数'],
          suggestions: [
            '每天花30分钟练习二次函数相关题目，重点掌握顶点坐标和开口方向的判断',
            '多做几何证明题，培养逻辑推理能力',
            '利用周末时间系统复习三角函数的基本公式和应用',
            '建立错题本，定期回顾错题，避免重复犯错'
          ],
          encouragement: '你是一个有潜力的学生，只要坚持努力，一定能够取得更大的进步！加油！'
        }
      })
    }, 2000)
    
    // 后续可以调用云函数生成真实的学习方案
    // wx.cloud.callFunction({
    //   name: 'ai-service',
    //   data: {
    //     action: 'generatePlan',
    //     studentId: app.globalData.userInfo.openid,
    //     studentName: app.globalData.userInfo.nickName
    //   },
    //   success: (res) => {
    //     this.setData({
    //       loading: false,
    //       learningPlan: res.result.plan
    //     })
    //   },
    //   fail: (err) => {
    //     this.setData({ loading: false })
    //     wx.showToast({
    //       title: '生成方案失败，请重试',
    //       icon: 'none'
    //     })
    //   }
    // })
  }
})