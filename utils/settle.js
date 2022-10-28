require('dotenv').config()
const db = require('../models');
const { StatusCodes } = require('http-status-codes')
const { BadRequestError, NotFoundError } = require('../errors')
const { Participant, Receipt} = db;
const { Op } = db.Sequelize;

exports.start = async (schedule_id) => {
  let data=[]

  await Participant.findAll({
    where : {schedule_id}
  }).then(result=>{
    result.forEach(participant=>{
      data.push({
        user:participant.participant_id,
        payBill:0
      })
    })
    return result
  })

  
  await Receipt.findAll({
    where : {schedule_id}
  }).then(result=>{
    result.forEach(receipt=>{
      target_idx=data.findIndex(user=>user.user==receipt.poster_id)
      data[target_idx].payBill+=receipt.total_price
    })
    return result
  }).catch(err=>{
    console.log(err)
  })

  //0. receiver, sender 리스트 생성
  let receiver=[]
  let sender=[]
  let result=[]
  
  //1. 평균 금액 구하기 
  const sum = data.map(user => user.payBill)
    .reduce((prev, curr) => prev + curr, 0);

  //1-1. 만약 평균 금액이 정수로 나누어떨어지지 않는다면 정수랑 근사하게 나누기
  const average = parseInt(Math.floor(sum/(data.length)))
  
  for(var i=0;i<data.length;i++){
    if(i==0){ //방장에게 제일 큰 값 또는 나중에는 랜덤하게 부여
      data[i].averageBill=sum-average*(data.length-1)
    }
    else{
      data[i].averageBill=average
    }

    data[i].dutyBill = data[i].payBill - data[i].averageBill
    
    if(data[i].dutyBill>0){ //돈을 더 받아야함
      receiver.push(data[i])
    }else{ // 돈을 더 내야함
      sender.push(data[i])
    }
  }
  
  while(receiver.length!=0){
    //2. 돈 받아야하는 사람과 돈갚아야 하는 사람 두 리스트로 나눈 후 절댓값으로 정렬
    //3. 돈 받아야하는 사람 처음부터 갚아야 하는사람 금액과 비교 후 같으면 
    //   바로 리스트에서 제거 후 두 리스트 다시 정렬
    //4. 3번을 한번도 수행하지 못했다면 
    //   돈 받아야하는 사람과 갚아야하는 사람 제일 큰 사람들끼리 송금 후 재정렬
    //5. 돈받야하는 사람 리스트가 빌 때까지 반복
    receiver.sort(function(a,b){ // 받는 사람, 보내는 사람 모두 절댓값으로 정렬
      return a.dutyBill < b.dutyBill ? 1 : a.dutyBill > b.dutyBill ? -1 : 0
    })
    sender.sort(function(a,b){ 
      return a.dutyBill < b.dutyBill ? -1 : a.dutyBill > b.dutyBill ? 1 : 0
    })
    let success_flag=0
    let exit_flag=0
    for (let i in receiver) {
      for (let j in sender) {
        if (receiver[i].dutyBill + sender[j].dutyBill == 0) {

          result.push({
            sender: sender[j].user,
            receiver: receiver[i].user,
            amount: receiver[i].dutyBill
          })

          sender.splice(j, 1)
          receiver.splice(i, 1)

          exit_flag=1
          break
          // throw new Error(`금액이 일치함`) //일치하는거 발견 시 throw
        }
      }
      if(exit_flag){
        exit_flag=0
        success_flag=1
        break
      }
    }

    if (!success_flag) {//일치하는거 발견 못했을때 첫 번째 요소끼리만 비교해서 빼기
      let totalSendBill = receiver[0].dutyBill + sender[0].dutyBill
      // receiver 금액과 sender 금액의 합이 0보다 클 때 : sender 금액만큼 보내주기
      // receiver 금액과 sender 금액의 합이 0보다 작을 때 : receiver 금액만큼 보내주기

      if (totalSendBill>0){ // 양수일 때는 돈받아야하는 사람이 남은거
        receiver[0].dutyBill=totalSendBill
        result.push({
          sender:sender[0].user,
          receiver:receiver[0].user,
          amount:-1*sender[0].dutyBill 
        })
        sender.shift()
      }else{ // 음수일때는 돈보내야하는 사람이 남은거
        sender[0].dutyBill=totalSendBill
        result.push({
          sender:sender[0].user,
          receiver:receiver[0].user,
          amount:receiver[0].dutyBill
        })
        receiver.shift()
      }
      
    }
  }
  

  return result
}


// let data = [
//   {
//     user:"A",
//     payBill:35000
//   },
//   {
//     user:"B",
//     payBill:25000
//   },
//   {
//     user:"C",
//     payBill:10000
//   },
//   {
//     user:"D",
//     payBill:5000
//   },
//   {
//     user:"E",
//     payBill:0
//   },
// ]