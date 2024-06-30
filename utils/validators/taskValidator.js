const slugify = require('slugify');
const { check, body } = require('express-validator');
const {validatorMiddleware} = require('../../middlewares/validationMiddleWare');
const userModel = require("./../../models/userModel")
const taskModel = require('../../models/taskModel')

exports.createTaskValidator = [
  body('description').notEmpty().withMessage('description required'),
  
  body('member').notEmpty().withMessage('member required').custom(async (val, { req }) => {
    const member = await userModel.findById(val);
    if (!member || member.role !== 'member') {
      throw new Error(`This is not member`);
    }if(!member.team){
      throw new Error(`This member haven't team`);
    }
    if (member.team.toString() !== req.user.team.toString()) {
      throw new Error(`This member is not From This Team`);
    }  }),
    check("deadline").notEmpty().withMessage("deadline is required").custom((val , {req})=>{
      const regex = /^\d{4}\-(0[1-9]|1[0-2])\-(0[1-9]|[12][0-9]|3[01])$/
      const match =regex.test(val)
      if(!match){
          throw new Error ("Date must be in format YYYY-MM-DD")
      }
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const deadlineDate = new Date(val);
      deadlineDate.setHours(0, 0, 0, 0);
      if (deadlineDate < today) {
        throw new Error ("Deadline must be today or in the future")
      }
      return true;
    }),
    check("startDate").notEmpty().withMessage("startDate is required").custom((val , {req})=>{
      const regex = /^\d{4}\-(0[1-9]|1[0-2])\-(0[1-9]|[12][0-9]|3[01])$/
      const match =regex.test(val)
      if(!match){
        throw new Error ("Date must be in format YYYY-MM-DD")
      }
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const startDate = new Date(val);
      startDate.setHours(0, 0, 0, 0);
      if (startDate > today) {
        throw new Error ("startDate must be today or in the future")
      }
      return true;
    }),
  validatorMiddleware,
]

exports.getTaskValidator = [
  check('id').isMongoId().withMessage('Invalid ID formate').custom(async (val , {req})=>{
  const task = await taskModel.findById(val)
  if(!task){
    throw new Error('No Task Found With this Id')
  }
  if(req.user.role=='team leader'){
    if(task.teamLeader.toString()!==req.user._id.toString()){
      throw new Error(`you are not related to Task`);
    }
  }
  if(req.user.role=='member'){
    if(task.member.toString()!==req.user._id.toString()){
      throw new Error(`you are not related to Task`);
    }
  }
}),

validatorMiddleware,
]

exports.updateTaskValidator = [
  check('id').isMongoId().withMessage('Invalid ID formate').custom(async(val,{req})=>{
    const task = await taskModel.findById(val)
    if(!task){
      throw new Error('No Task Found With this Id')
    }
    if(task.teamLeader.toString() !== req.user._id.toString()){
      throw new Error(`you are not related to Task`);
    }
  }),
  check('description').optional(),

  validatorMiddleware,
]

exports.deleteTaskValidator = [
  check('id').isMongoId().withMessage('Invalid ID formate'),
  validatorMiddleware,
]

exports.completeTaskValidator = [
  check("id").isMongoId().withMessage('Invalid ID formate').custom(async(val , {req})=>{
    const today = new Date() 
    today.setHours(0, 0, 0, 0)

    const task = await taskModel.find({ _id : val , deadline:{ $lt:today }})
    
    if(!task){
      throw new Error('No Task Found With this Id')
    }
    if(req.user.role=='team leader'){
      if(task.member.toString()!==req.user._id.toString()){
        throw new Error(`you are not related to Task`);
      }
    }
  })
]
exports.getTasksForMemberValidator = [
  check('id').isMongoId().withMessage('Invalid ID formate').custom(async (val , {req})=>{
    if(req.user.role == 'team leader'){
        person = await userModel.findById(val);
      if (!person || person.role !== 'member') {
        throw new Error(`This is not member`);
      } else if (person.team.toString() !== req.user.team.toString()) {
        throw new Error(`This member is in a team`);
      }
    }
  }),
  validatorMiddleware,
]