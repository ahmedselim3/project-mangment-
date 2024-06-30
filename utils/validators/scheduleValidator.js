const { check, body} = require('express-validator')
const {validatorMiddleware} = require("../../middlewares/validationMiddleWare")
const scheduleModel = require('../../models/scheduleModel')

const checkFormat = (str) =>{
    const regex = /^(0?[1-9]|1[0-2]):[0-5][0-9] (AM|PM)$/
    const match =regex.test(str)
    if(!match){
        throw new Error ("Time must be in format HH:MM AM/PM")
    }
}

exports.createScheduleValidator = [
    body("lunch").optional().custom((val)=>{
        checkFormat(val);
        return true;
    }),
    body("coffeeBreak").optional().custom((val)=>{
        checkFormat(val);
        return true;
    }),
    body("groupMeeting").optional().custom((val)=>{
        checkFormat(val);
        return true;
    }),
    body("specialTime").optional().custom((val)=>{
        val.map((meet)=>{checkFormat(meet.time);})
        return true;
    }),
    validatorMiddleware
]

exports.getScheduleValidator = [
    check("id").isMongoId().withMessage('Invalid id format').notEmpty().withMessage("Id required").custom(async (val , {req}) =>{
        const schedule = await scheduleModel.findById(val)
        if(!schedule){
            throw {message:"There is no Schedule."}
        }
        if(!req.user.team){
            throw {message:"You are not have a Team"}
        }
        if(req.user.team.toString() !== schedule.team.toString()){
            throw {message:"You are not From this Team"}
        }
    }),
    validatorMiddleware
]

exports.updateScheduleValidator = [
    body("lunch").optional().custom((val)=>{
        checkFormat(val);
        return true;
    }),
    body("coffeeBreak").optional().custom((val)=>{
        checkFormat(val);
        return true;
    }),
    body("groupMeeting").optional().custom((val)=>{
        checkFormat(val);
        return true;
    }),
    body("specialTime").optional().custom((val)=>{
        val.map((meet)=>{checkFormat(meet.time);})
        return true;
    }),
    check("id").isMongoId().withMessage('Invalid id format').notEmpty().withMessage("Id required").custom(async (val , {req}) =>{
        const schedule = await scheduleModel.findById(val)
        if(!schedule){
            throw {message:"There is no Schedule."}
        }
        if(!req.user.team){
            throw {message:"You are not have a Team"}
        }
        if(req.user.team.toString() !== schedule.team.toString()){
            throw {message:"You are not From this Team"}
        }
    }),
    validatorMiddleware
]

exports.deleteScheduleValidator = [
    check("id").isMongoId().withMessage('Invalid id format').notEmpty().withMessage("Id required").custom(async (val , {req}) =>{
        const schedule = await scheduleModel.findById(val)
        if(!schedule){
            throw {message:"There is no Schedule."}
        }
        if(!req.user.team){
            throw {message:"You are not have a Team"}
        }
        if(req.user.team.toString() !== schedule.team.toString()){
            throw {message:"You are not From this Team"}
        }
    }),
    validatorMiddleware
]