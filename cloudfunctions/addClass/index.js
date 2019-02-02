const cloud = require('wx-server-sdk')
cloud.init()
const db = cloud.database()
const classesCollection = db.collection('classes')

// 云函数入口函数
exports.main = async (event, context) => new Promise((resolve, reject) => {
  classesCollection.add({
    data: {
      name: event.name,
      _openid: event.userInfo.openId
    }
  }).then(res => {
    resolve(res)
  })
})