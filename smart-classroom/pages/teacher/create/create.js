// pages/teacher/create/create.js
Page({
  data: {
    assignment: {
      title: '',
      subject: '数学'
    },
    subjects: ['数学', '语文', '英语', '物理', '化学'],
    subjectIndex: 0,
    questions: [],
    isEdit: false,
    assignmentId: null
  },

  onLoad(options) {
    // 检查是否是编辑模式
    if (options.id) {
      this.setData({
        isEdit: true,
        assignmentId: options.id
      })
      this.getAssignmentDetail(options.id)
    } else {
      // 添加默认题目
      this.addQuestion()
    }
  },

  // 获取作业详情
  getAssignmentDetail(id) {
    wx.cloud.callFunction({
      name: 'assignment',
      data: {
        action: 'read',
        id: id
      },
      success: (res) => {
        const assignment = res.result.data
        if (assignment) {
          this.setData({
            assignment: {
              title: assignment.title,
              subject: assignment.subject
            },
            subjectIndex: this.data.subjects.indexOf(assignment.subject),
            questions: assignment.questions
          })
        }
      },
      fail: (err) => {
        wx.showToast({
          title: '获取作业详情失败',
          icon: 'none'
        })
      }
    })
  },

  // 作业标题变化
  onTitleChange(e) {
    this.setData({
      'assignment.title': e.detail.value
    })
  },

  // 学科选择变化
  onSubjectChange(e) {
    const index = e.detail.value
    this.setData({
      subjectIndex: index,
      'assignment.subject': this.data.subjects[index]
    })
  },

  // 添加题目
  addQuestion() {
    const newQuestion = {
      question: '',
      options: ['', '', '', ''],
      correctAnswer: 0
    }
    this.setData({
      questions: [...this.data.questions, newQuestion]
    })
  },

  // 删除题目
  deleteQuestion(e) {
    const index = e.currentTarget.dataset.index
    const questions = this.data.questions
    questions.splice(index, 1)
    this.setData({
      questions: questions
    })
  },

  // 题目文本变化
  onQuestionChange(e) {
    const index = e.currentTarget.dataset.index
    const value = e.detail.value
    const questions = this.data.questions
    questions[index].question = value
    this.setData({
      questions: questions
    })
  },

  // 选项变化
  onOptionChange(e) {
    const qindex = e.currentTarget.dataset.qindex
    const oindex = e.currentTarget.dataset.oindex
    const value = e.detail.value
    const questions = this.data.questions
    questions[qindex].options[oindex] = value
    this.setData({
      questions: questions
    })
  },

  // 正确答案变化
  onCorrectAnswerChange(e) {
    const index = e.currentTarget.dataset.index
    const value = e.detail.value
    const questions = this.data.questions
    questions[index].correctAnswer = value
    this.setData({
      questions: questions
    })
  },

  // 发布作业
  publishAssignment() {
    const { assignment, questions, isEdit, assignmentId } = this.data
    
    // 验证输入
    if (!assignment.title) {
      wx.showToast({ title: '请输入作业标题', icon: 'none' })
      return
    }
    
    if (questions.length === 0) {
      wx.showToast({ title: '请至少添加一道题目', icon: 'none' })
      return
    }
    
    // 验证题目内容
    for (let i = 0; i < questions.length; i++) {
      const q = questions[i]
      if (!q.question) {
        wx.showToast({ title: `第${i + 1}题题目不能为空`, icon: 'none' })
        return
      }
      for (let j = 0; j < q.options.length; j++) {
        if (!q.options[j]) {
          wx.showToast({ title: `第${i + 1}题选项${String.fromCharCode(65 + j)}不能为空`, icon: 'none' })
          return
        }
      }
    }
    
    const action = isEdit ? 'update' : 'create'
    const data = {
      action,
      assignment: {
        ...assignment,
        questions
      }
    }
    
    if (isEdit) {
      data.id = assignmentId
    }
    
    wx.cloud.callFunction({
      name: 'assignment',
      data: data,
      success: (res) => {
        wx.showToast({
          title: isEdit ? '作业更新成功' : '作业发布成功',
          icon: 'success'
        })
        setTimeout(() => {
          wx.navigateBack()
        }, 1500)
      },
      fail: (err) => {
        wx.showToast({
          title: isEdit ? '作业更新失败' : '作业发布失败',
          icon: 'none'
        })
      }
    })
  }
})