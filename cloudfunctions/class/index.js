const cloud = require('wx-server-sdk')
cloud.init()

const db = cloud.database()
const _ = db.command
const classesCollection = db.collection('classes')

exports.main = async (event, context) => {
  switch (event.type) {
    case 'add':
      try {
        const data = event.formValue
        data.menberList = []
        data._openid = event.userInfo.openId
        data.createTime = db.serverDate()
        return await classesCollection.add({
          data
        })
      } catch (e) {
        console.error(e)
      }
      break
    case 'update':
      try {
        const data = event.formValue
        return await classesCollection.doc(event._id).update({
          data
        })
      } catch (e) {
        console.error(e)
      }
      break
    case 'remove':
      try {
        return await classesCollection.doc(event._id).remove()
      } catch (e) {
        console.error(e)
      }
      break
    case 'signUp':
      try {
        return await classesCollection.doc(event._id).update({
          data: {
            menberList: _.push({
              _openid: event.userInfo.openId,
              name: event.name,
              createTime: db.serverDate()
            })
          }
        })
      } catch (e) {
        console.error(e)
      }
      break
    case 'signOut':
      try {
        const { data: { menberList } } = await classesCollection.doc(event._id).get()
        menberList.splice(event.menberIdx, 1)
        return await classesCollection.doc(event._id).update({
          data: {
            menberList: _.set(menberList)
          }
        })
      } catch (e) {
        console.error(e)
      }
      break
    default:
  }
}