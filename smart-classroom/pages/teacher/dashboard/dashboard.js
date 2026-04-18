// pages/teacher/dashboard/dashboard.js
Page({
  data: {
    averageScore: 0,
    rankings: [],
    weakPoints: [],
    recentSubmissions: []
  },

  onLoad() {
    this.getDashboardData()
  },

  // 获取看板数据
  getDashboardData() {
    // 模拟数据
    this.setData({
      averageScore: 75,
      rankings: [
        { name: '张优秀', score: 95 },
        { name: '李良好', score: 80 },
        { name: '王中等', score: 65 },
        { name: '赵较弱', score: 45 },
        { name: '刘较差', score: 30 }
      ],
      weakPoints: [
        { name: '二次函数', value: 8 },
        { name: '几何证明', value: 6 },
        { name: '三角函数', value: 5 },
        { name: '概率统计', value: 4 },
        { name: '立体几何', value: 3 }
      ],
      recentSubmissions: [
        {
          _id: '1',
          studentName: '张优秀',
          assignmentTitle: '二次函数基础',
          score: 95,
          createdAt: new Date()
        },
        {
          _id: '2',
          studentName: '李良好',
          assignmentTitle: '一元二次方程',
          score: 80,
          createdAt: new Date(Date.now() - 3600000)
        },
        {
          _id: '3',
          studentName: '王中等',
          assignmentTitle: '几何证明初步',
          score: 65,
          createdAt: new Date(Date.now() - 7200000)
        }
      ]
    })
    
    // 后续可以通过云函数获取真实数据
    // wx.cloud.callFunction({
    //   name: 'dashboard',
    //   data: {
    //     action: 'getDashboardData'
    //   },
    //   success: (res) => {
    //     this.setData({
    //       averageScore: res.result.averageScore,
    //       rankings: res.result.rankings,
    //       weakPoints: res.result.weakPoints,
    //       recentSubmissions: res.result.recentSubmissions
    //     })
    //     this.initChart()
    //   },
    //   fail: (err) => {
    //     wx.showToast({
    //       title: '获取数据失败',
    //       icon: 'none'
    //     })
    //   }
    // })
  },

  // 初始化图表
  initChart() {
    // 后续集成ECharts
    // const chart = echarts.init(this.selectComponent('#weakPointsChart'))
    // const option = {
    //   xAxis: {
    //     type: 'category',
    //     data: this.data.weakPoints.map(item => item.name)
    //   },
    //   yAxis: {
    //     type: 'value'
    //   },
    //   series: [{
    //     data: this.data.weakPoints.map(item => item.value),
    //     type: 'bar',
    //     itemStyle: {
    //       color: '#1976D2'
    //     }
    //   }]
    // }
    // chart.setOption(option)
  },

  // 格式化日期
  formatDate(date) {
    if (!date) return ''
    const d = new Date(date)
    return `${d.getMonth() + 1}/${d.getDate()} ${d.getHours()}:${d.getMinutes()}`
  },

  onPullDownRefresh() {
    this.getDashboardData()
    wx.stopPullDownRefresh()
  }
})