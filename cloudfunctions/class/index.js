const cloud = require('wx-server-sdk')
cloud.init({
  env: 'sign-up-652910'
})

const db = cloud.database()
const _ = db.command
const classesCollection = db.collection('classes')
const userCollection = db.collection('user')
const signListCollection = db.collection('sign-list')

exports.main = async (event, context) => {
  console.log('event:', event)

  switch (event.type) {
    case 'add':
      try {
        const data = event.formValue
        data.leftNum = data.maxNum
        data._openid = event.userInfo.openId
        data.createTime = db.serverDate()

        const res = await classesCollection.add({
          data
        })
        data._id = res._id
        res._data = data

        return res
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
        const doc = classesCollection.doc(event._id)

        // 获取课程剩余名额
        const { data: { leftNum } } = await doc.get()
        if (leftNum > 0) {
          await doc.update({
            data: {
              leftNum: _.inc(-1)
            }
          })
          return await signListCollection.add({
            data: {
              classId: event._id,
              _openid: event.userInfo.openId,
              name: event.name,
              tel: event.tel,
              createTime: db.serverDate()
            }
          })
        } else {
          return {
            ret: -10001 // 课程报名人数已满
          }
        }
      } catch (e) {
        console.error(e)
      }
      break
    case 'signOut':
      try {
        await signListCollection.where({
          _openid: event.userInfo.openId,
          classId: event._id,
          name: event.name
        }).remove()
        await classesCollection.doc(event._id).update({
          data: {
            leftNum: _.inc(1)
          }
        })
        return {
          ret: 0
        }
      } catch (e) {
        console.error(e)
      }
      break
    default:
  }
}