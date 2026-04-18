// pages/student/quiz/quiz.js
Page({
  data: {
    questions: [],
    currentIndex: 0,
    selected: -1,
    answers: [],
    startTime: null,
    duration: 0,
    submitted: false,
    score: 0
  },

  onLoad(options) {
    this.setData({
      startTime: Date.now()
    })
    this.startTimer()
    this.getAssignment(options.id)
  },

  // 获取作业题目
  getAssignment(id) {
    // 模拟数据
    this.setData({
      questions: [
        {
          question: '二次函数 y = x² - 4x + 3 的顶点坐标是？',
          options: ['(2, -1)', '(2, 1)', '(-2, -1)', '(-2, 1)'],
          correctAnswer: 0
        },
        {
          question: '一元二次方程 x² - 5x + 6 = 0 的解是？',
          options: ['x=2, x=3', 'x=1, x=6', 'x=-2, x=-3', 'x=-1, x=-6'],
          correctAnswer: 0
        },
        {
          question: '下列哪个函数是二次函数？',
          options: ['y = 2x + 1', 'y = x² + 2x + 1', 'y = 1/x', 'y = √x'],
          correctAnswer: 1
        },
        {
          question: '二次函数 y = -x² + 2x + 3 的开口方向是？',
          options: ['向上', '向下', '向左', '向右'],
          correctAnswer: 1
        },
        {
          question: '二次函数 y = x² + 4x + 4 的零点是？',
          options: ['x=2', 'x=-2', 'x=4', 'x=-4'],
          correctAnswer: 1
        }
      ],
      answers: new Array(5).fill(-1)
    })
    
    // 后续可以通过云函数获取真实数据
    // wx.cloud.callFunction({
    //   name: 'assignment',
    //   data: {
    //     action: 'read',
    //     id: id
    //   },
    //   success: (res) => {
    //     const assignment = res.result.data
    //     this.setData({
    //       questions: assignment.questions,
    //       answers: new Array(assignment.questions.length).fill(-1)
    //     })
    //   },
    //   fail: (err) => {
    //     wx.showToast({
    //       title: '获取题目失败',
    //       icon: 'none'
    //     })
    //   }
    // })
  },

  // 开始计时
  startTimer() {
    setInterval(() => {
      if (!this.data.submitted) {
        this.setData({
          duration: Math.floor((Date.now() - this.data.startTime) / 1000)
        })
      }
    }, 1000)
  },

  // 格式化时间
  formatTime(seconds) {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
  },

  // 选择答案
  onSelect(e) {
    this.setData({
      selected: e.currentTarget.dataset.index
    })
  },

  // 上一题
  onPrev() {
    const { currentIndex, selected, answers } = this.data
    if (currentIndex > 0) {
      answers[currentIndex] = selected
      this.setData({
        answers,
        currentIndex: currentIndex - 1,
        selected: answers[currentIndex - 1]
      })
    }
  },

  // 下一题
  onNext() {
    const { currentIndex, selected, answers, questions } = this.data
    if (currentIndex < questions.length - 1) {
      answers[currentIndex] = selected
      this.setData({
        answers,
        currentIndex: currentIndex + 1,
        selected: answers[currentIndex + 1]
      })
    }
  },

  // 提交作业
  onSubmit() {
    const { answers, questions, duration } = this.data
    
    // 保存当前题目的答案
    answers[this.data.currentIndex] = this.data.selected
    
    // 计算得分
    const score = answers.reduce((sum, ans, i) => {
      return sum + (ans === questions[i].correctAnswer ? 10 : 0)
    }, 0)
    
    // 停止计时
    this.setData({
      submitted: true,
      score,
      answers
    })
    
    // 调用云函数保存结果
    // wx.cloud.callFunction({
    //   name: 'quiz',
    //   data: {
    //     action: 'submit',
    //     assignmentId: this.data.assignmentId,
    //     answers: answers,
    //     score: score,
    //     duration: duration
    //   },
    //   success: (res) => {
    //     console.log('提交成功', res)
    //   },
    //   fail: (err) => {
    //     console.error('提交失败', err)
    //   }
    // })
  },

  // 返回作业列表
  navigateBack() {
    wx.navigateBack()
  }
})