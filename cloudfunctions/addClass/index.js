const cloud = require('wx-server-sdk')
cloud.init()
const db = cloud.database()
const classesCollection = db.collection('classes')

// 云函数入口函数
exports.main = async (event, context) => new Promise((resolve, reject) => {
  classesCollection.add({
    data: {
      name: '毛笔'
    },
    success: res => {
      resolve(res)
    },
    fail: res => {
      resolve(res)
    }
  })
})