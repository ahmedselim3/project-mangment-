const asyncHandler = require('express-async-handler')
const ApiError = require("../utils/apiError")
const teamModel = require("../models/teamModel")
const userModel = require("../models/userModel")


// manger
exports.createTeam = asyncHandler(async (req, res , next) => {
    const {members , teamLeader} = req.body
    const team = await teamModel.create(req.body)
    if(members){
        members.map(async (member) =>{
            await userModel.findByIdAndUpdate({_id:member},{team:team._id},{new:true})
        })
    }
    if(teamLeader){
        await userModel.findByIdAndUpdate({_id:teamLeader},{team:team._id},{new:true})
    }
    res.status(200).json({message: "Done successfully" , data: team})
})

// manger
exports.getTeams = asyncHandler(async (req, res , next) => {
    const teams = await teamModel.find()
    res.status(200).json({message: "Done successfully" ,numberOfTeam:teams.length, data: teams})
})


// manger
exports.getTeam = asyncHandler(async (req , res , next) =>{
    const {id} = req.params
    const team = await teamModel.findById(id).populate('teamLeader members')
    if(!team){
        return next(new ApiError('team Not Found', 401))
    }
    res.status(200).json({message :"Done Successfully",data :team });
})

// team leader - member
exports.getMyTeam = asyncHandler(async (req, res, next) => {
    try {
      const team = await teamModel.findById({ _id: req.user.team }).populate('teamLeader members');
      if (!team) {
        return next(new ApiError('Team not found', 404));
      }
      res.status(200).json({ message: 'Done Successfully', data: team });
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: 'Server error' });
    }
  });

// manger
exports.updateTeamTitle = asyncHandler(async (req, res , next) => {
    const {id} = req.params
    const team = await teamModel.findByIdAndUpdate({_id: id},{title : req.body.title},{new: true})
    if(!team){
        return next(new ApiError('team Not Found', 401))
    }
    res.status(200).json({message: "Done successfully" , data: team})
})


// manger
exports.addMember =asyncHandler(async (req, res , next) => {
    const {id} = req.params
    const {members}=req.body
    const team = await teamModel.findByIdAndUpdate({_id: id},{$addToSet :{members: members}},{new: true})
    if(!team){
        return next(new ApiError('team Not Found', 401))
    }
    members.map(async(member)=>{
        await userModel.findByIdAndUpdate({_id:member},{team:team._id},{new: true})
    })
    res.status(200).json({message: "Done successfully" , data: team})
})

exports.addTeamLeader =asyncHandler(async (req, res , next) => {
    const {id} = req.params
    const {teamLeader} = req.body
    const team = await teamModel.findByIdAndUpdate({_id: id},{teamLeader: teamLeader},{new: true})
    if(!team){
        return next(new ApiError('team Not Found', 401))
    }
    await userModel.findByIdAndUpdate({_id: teamLeader}, {team:team._id}, {new: true})
    res.status(200).json({message: "Done successfully" , data: team})
})

exports.deleteMember =asyncHandler(async (req, res , next) => {
    const {id} = req.params
    const {members} = req.body
    const team = await teamModel.findById(id)
    if(!team){
        return next(new ApiError('team Not Found', 401))
    }
    team.members = team.members.filter(val => !members.includes(val.toString()));
    await team.save();
    
    members.map(async (member)=>{
        await userModel.findByIdAndUpdate({_id: member}, {team:null}, {new: true})
    })
    res.status(200).json({message: "Done successfully" , data: team})
})

exports.deleteTeamLeader =asyncHandler(async (req, res , next) => {
    const {id} = req.params
    const {teamLeader} = req.body
    const team = await teamModel.findByIdAndUpdate({_id:id} , {teamLeader:null} , {new:true})
    if(!team){
        return next(new ApiError('team Not Found', 401))
    }
    await userModel.findByIdAndUpdate({_id:teamLeader},{team:null},{new : true})
    res.status(200).json({message: "Done successfully" , data: team})
})

// manger
exports.deleteTeam = asyncHandler(async (req, res , next) => {
    const {id} = req.params
    const team = await teamModel.findByIdAndDelete(id)
    if(!team){
        return next(new ApiError('team Not Found', 401))
    }
    if(team.teamLeader){
        await userModel.findByIdAndUpdate({_id:team.teamLeader},{team:null},{new:true})
    }
    if(team.members){
        team.members.map(async (member)=>{
            await userModel.findByIdAndUpdate({_id:member},{team:null},{new:true})
        })
    }
    res.status(200).json({message: "Done successfully"})
})
