const cloud = require('wx-server-sdk')
cloud.init()

const db = cloud.database()
const _ = db.command
const classesCollection = db.collection('classes')
const userCollection = db.collection('user')

exports.main = async (event, context) => {
  console.log('event:', event)

  switch (event.type) {
    case 'add':
      try {
        const data = event.formValue
        data.menberList = []
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
        const { data: { menberList, maxNum } } = await classesCollection.doc(event._id).get()

        if (menberList.length < maxNum) {
          const _openid = event.userInfo.openId
          await classesCollection.doc(event._id).update({
            data: {
              menberList: _.push({
                _openid,
                name: event.name,
                createTime: db.serverDate()
              })
            }
          })
          return await userCollection.where({
            _openid
          }).update({
            data: {
              classes: _.push(event._id)
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
        const doc = classesCollection.doc(event._id)
        const { data: { menberList } } = await doc.get()
        let menberIdx = -1
        const _openid = event.userInfo.openId
        menberList.forEach((menber, idx) => {
          if (menber !== null && menber._openid === _openid && menber.name === event.name) {
            menberIdx = idx
          }
        })
        menberList.splice(menberIdx, 1)
        await doc.update({
          data: {
            menberList: _.set(menberList)
          }
        })

        const query = userCollection.where({
          _openid
        })
        const signedUpList = await query.get()
        const classes = signedUpList.data[0].classes
        classes.splice(classes.indexOf(event._id), 1)
        await query.update({
          data: {
            classes: _.set(classes)
          }
        })
        return {
          ret: 0,
          menberIdx
        }
      } catch (e) {
        console.error(e)
      }
      break
    default:
  }
}