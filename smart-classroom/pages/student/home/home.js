// pages/student/home/home.js
Page({
  data: {
    userInfo: null,
    pendingAssignments: [],
    completedAssignments: []
  },

  onLoad() {
    // 获取用户信息
    const app = getApp()
    this.setData({
      userInfo: app.globalData.userInfo
    })
    
    // 获取作业列表
    this.getAssignments()
  },

  // 获取作业列表
  getAssignments() {
    // 模拟数据
    this.setData({
      pendingAssignments: [
        {
          _id: '1',
          title: '二次函数基础',
          subject: '数学',
          questions: [{}, {}, {}, {}, {}],
          createdAt: new Date()
        },
        {
          _id: '2',
          title: '一元二次方程',
          subject: '数学',
          questions: [{}, {}, {}, {}, {}, {}],
          createdAt: new Date(Date.now() - 86400000)
        }
      ],
      completedAssignments: [
        {
          _id: '3',
          title: '几何证明初步',
          subject: '数学',
          questions: [{}, {}, {}, {}, {}],
          score: 85,
          createdAt: new Date(Date.now() - 172800000)
        }
      ]
    })
    
    // 后续可以通过云函数获取真实数据
    // wx.cloud.callFunction({
    //   name: 'assignment',
    //   data: {
    //     action: 'read',
    //     studentId: app.globalData.userInfo.openid
    //   },
    //   success: (res) => {
    //     const assignments = res.result.data || []
    //     const pending = assignments.filter(a => !a.completed)
    //     const completed = assignments.filter(a => a.completed)
    //     this.setData({
    //       pendingAssignments: pending,
    //       completedAssignments: completed
    //     })
    //   },
    //   fail: (err) => {
    //     wx.showToast({
    //       title: '获取作业失败',
    //       icon: 'none'
    //     })
    //   }
    // })
  },

  // 开始做题
  startQuiz(e) {
    const assignmentId = e.currentTarget.dataset.id
    wx.navigateTo({
      url: `/pages/student/quiz/quiz?id=${assignmentId}`
    })
  },

  // 查看结果
  viewResult(e) {
    const assignmentId = e.currentTarget.dataset.id
    wx.navigateTo({
      url: `/pages/student/quiz/quiz?id=${assignmentId}&view=true`
    })
  },

  // 格式化日期
  formatDate(date) {
    if (!date) return ''
    const d = new Date(date)
    return `${d.getMonth() + 1}/${d.getDate()} ${d.getHours()}:${d.getMinutes()}`
  },

  onPullDownRefresh() {
    this.getAssignments()
    wx.stopPullDownRefresh()
  }
})