// cloudfunctions/ai-service/index.js
const cloud = require('wx-server-sdk')
cloud.init()
const db = cloud.database()

const SYSTEM_PROMPT = `你是一位经验丰富的教育专家。根据学生的做题数据，生成个性化学习方案。
输入数据：学生姓名、平均分、薄弱知识点列表、做题时间分布
输出格式（严格JSON）：
{
  "assessment": "学习状况评估（80字内）",
  "weakPoints": ["知识点1", "知识点2", ...],
  "suggestions": ["建议1", "建议2", ...],
  "encouragement": "个性化鼓励语（30字内）"
}`

exports.main = async (event, context) => {
  const { action, studentId, studentName } = event
  const wxContext = cloud.getWXContext()
  
  try {
    switch (action) {
      case 'generatePlan':
        // 1. 获取学生做题数据
        const results = await db.collection('quiz_results')
          .where({ studentId: wxContext.OPENID })
          .orderBy('createdAt', 'desc')
          .limit(20)
          .get()
        
        // 2. 分析数据
        const scores = results.data.map(r => r.score)
        const avgScore = scores.length > 0 ? scores.reduce((a, b) => a + b, 0) / scores.length : 0
        const weakTopics = analyzeWeakTopics(results.data)
        
        // 3. 调用DeepSeek API
        const plan = await callDeepSeek({
          avgScore: avgScore,
          weakPoints: weakTopics,
          studentName: studentName
        })
        
        // 4. 存储学习方案
        await db.collection('learning_plans').add({
          data: {
            studentId: wxContext.OPENID,
            content: plan,
            createdAt: db.serverDate()
          }
        })
        
        return {
          success: true,
          plan: JSON.parse(plan)
        }
        
      case 'generateEncouragement':
        // 生成鼓励语
        const encouragement = await callDeepSeek({
          action: 'encouragement',
          studentName: studentName
        })
        
        return {
          success: true,
          encouragement: encouragement
        }
        
      case 'getPlan':
        // 获取最新的学习方案
        const latestPlan = await db.collection('learning_plans')
          .where({ studentId: wxContext.OPENID })
          .orderBy('createdAt', 'desc')
          .limit(1)
          .get()
        
        if (latestPlan.data.length > 0) {
          return {
            success: true,
            plan: JSON.parse(latestPlan.data[0].content)
          }
        } else {
          return {
            success: false,
            error: 'No learning plan found'
          }
        }
        
      default:
        return {
          success: false,
          error: 'Invalid action'
        }
    }
  } catch (err) {
    console.error(err)
    return {
      success: false,
      error: err.message
    }
  }
}

async function callDeepSeek(data) {
  // 模拟DeepSeek API调用
  if (data.action === 'encouragement') {
    return '你是最棒的！相信自己，一定能够取得好成绩！'
  }
  
  // 模拟生成学习方案
  return JSON.stringify({
    assessment: '你的学习基础较好，掌握了大部分知识点，但在二次函数和几何证明方面还有提升空间。建议重点加强这两个板块的练习。',
    weakPoints: ['二次函数', '几何证明', '三角函数'],
    suggestions: [
      '每天花30分钟练习二次函数相关题目，重点掌握顶点坐标和开口方向的判断',
      '多做几何证明题，培养逻辑推理能力',
      '利用周末时间系统复习三角函数的基本公式和应用',
      '建立错题本，定期回顾错题，避免重复犯错'
    ],
    encouragement: '你是一个有潜力的学生，只要坚持努力，一定能够取得更大的进步！加油！'
  })
  
  // 后续可以调用真实的DeepSeek API
  // const res = await cloud.callFunction({
  //   name: 'deepseek-proxy',
  //   data: {
  //     model: 'deepseek-ai/DeepSeek-V3',
  //     messages: [
  //       { role: 'system', content: SYSTEM_PROMPT },
  //       { role: 'user', content: JSON.stringify(data) }
  //     ]
  //   }
  // })
  // return res.result.choices[0].message.content
}

function analyzeWeakTopics(results) {
  // 模拟分析薄弱知识点
  return ['二次函数', '几何证明', '三角函数']
  
  // 后续可以根据实际做题结果分析薄弱知识点
  // const weakTopics = []
  // // 分析错题对应的知识点
  // return weakTopics
}