const asyncHandler = require('express-async-handler')
const ApiError = require("../utils/apiError")
const scheduleModel = require("../models/scheduleModel")
const teamModel = require("../models/teamModel")

// Route team leader
exports.createSchedule = asyncHandler(async (req, res , next) => {
    const team = await teamModel.findById(req.user.team)
    if(!team){
        return next(new ApiError('You are not have a team', 404))
    }
    req.body.teamLeader = req.user._id
    req.body.team = req.user.team
    req.body.members = team.members
    const schedule = await scheduleModel.create(req.body)
    res.status(200).json({message: "Done successfully" , data: schedule})
})

// Route team leader - member
exports.getSchedules = asyncHandler(async (req, res , next) => {
    const schedules = await scheduleModel.find({team: req.user.team})
    res.status(200).json({message: "Done successfully" , data: schedules})
})

// Route team leader & member
exports.getSchedule = asyncHandler(async (req, res , next) => {
    const {id} = req.params
    const schedule = await scheduleModel.findById(id)
    if(!schedule){
        return next(new ApiError('schedule Not Found', 401))
    }
    res.status(200).json({message: "Done successfully" , data: schedule})
})

// Route team leader
exports.updateSchedule = asyncHandler(async (req, res , next) => {
    const {id} = req.params
    const schedule = await scheduleModel.findByIdAndUpdate({_id: id},{
        lunch:req.body.lunch,
        coffeeBreak:req.body.coffeeBreak,
        groupMeeting:req.body.groupMeeting,
        specialTime:req.body.specialTime
    },{new: true})
    if(!schedule){
        return next(new ApiError('schedule Not Found', 401))
    }
    res.status(200).json({message: "Done successfully" , data: schedule})
})

// Route team leader
exports.deleteSchedule = asyncHandler(async (req, res , next) => {
    const {id} = req.params
    const schedule = await scheduleModel.findByIdAndDelete(id)
    if(!schedule){
        return next(new ApiError('schedule Not Found', 401))
    }
    res.status(200).json({message: "Done successfully"})
})