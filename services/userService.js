const sharp = require('sharp');
const asyncHandler = require('express-async-handler')
const { v4: uuidv4 } = require('uuid');
const bcrypt =require("bcryptjs")
const userModel = require("../models/userModel")
const {uploadSingleImage} =require("../middlewares/uploadImageMiddleWare")
const createtoken =require("../utils/createToken")
const ApiError = require("../utils/apiError")
const teamModel = require("../models/teamModel")

// @desc Upload Single Image
// @access Privet
exports.uploadUserImage = uploadSingleImage("profileImg")
// @desc image processing
exports.resizeImage =asyncHandler(async(req , res , next) =>{
    const filename = `user-${uuidv4()}-${Date.now()}.jpeg`
    await sharp(req.file.buffer)
    .resize(600 , 600)
    .toFormat('jpeg')
    .jpeg({quality : 100})
    .toFile(`uploads/users/${filename}`)
    req.body.image =filename
    next()
})

// @desc Create User
// @Route Post /api/v1/categories
// @access Privet - manger
exports.createUser =asyncHandler(async (req , res)=>{
    let person = await userModel.create(req.body);
    res.status(200).json({massage:"Added Success" , data:person})
})

// @desc Find some Categories
// @Route Get /api/v1/User
// @access public - manger
exports.getUsers = asyncHandler(async (req , res ) => {
    const users = await userModel.find()
    res.status(200).json({message :"Done Successfully" , numOfUsers : users.length ,result : users })
})

// @desc Find some Categories
// @Route Get /api/v1/User
// @access public - team leader
exports.getUsersTeam =  asyncHandler(async (req , res ) => {
    const teamLeader = await userModel.findById(req.user._id).populate('memberId')
    res.status(200).json({message :"Done Successfully" , totalMembers: teamLeader.memberId.length ,teamLeader:teamLeader.memberId })
})

// @desc Find User
// @Route Get /api/v1/User:id
// @access public - (manger - team leader)
exports.getUser = asyncHandler(async (req , res , next ) => {
    const {id} = req.params;
    const user = await userModel.findById(id);
    if(!user){
        return next (new ApiError("Invalid Id" , 404))
    }
    res.status(200).json({message :"Done Successfully" , data:user})
})

// @desc Update User
// @Route Put /api/v1/User:id
// @access public - manger

exports.updateUser = asyncHandler(async (req , res)=>{
    const {id} = req.params
    const user = await userModel.findByIdAndUpdate({_id:id} , {
        name : req.body.name,
        email : req.body.email,
        phone : req.body.phone,
        profileImg:req.body.profileImg
    } , {new : true})
    if(!user){
        res.status(400).json({message :"Invalid ID"})
    }
    res.json({massage:"Done Successfully" , data:user})
});

// @desc Update User PassWord
// @Route Put /api/v1/User:id
// @access public - manger

exports.updateUserPassWord = asyncHandler(async (req , res)=>{
    const {id} = req.params
    const user = await userModel.findByIdAndUpdate({_id:id} , {
        password : await bcrypt.hash(req.body.password , 12),
        passwordChangedAt : Date.now()
    } , {new : true})
    if(!user){
        res.status(400).json({message :"Invalid ID"})
    }
    res.json({massage:"Done Successfully" , data:user})
});

// @desc Delete User
// @Route Delete /api/v1/User:id
// @access public - manger
exports.deleteUser = asyncHandler(async (req, res, next) => {
    const {id} = req.params;
    const person = await userModel.findByIdAndDelete(id)
    if(!person){
        return next(new ApiError("Invalid Id" , 401))
    }
    if(person.team){
        if(person.role == 'team leader'){
            await teamModel.findByIdAndUpdate({_id:person.team},{teamLeader:""},{new:true})
        }
        if(person.role == 'member'){
            const team = await teamModel.findById(person.team)
            team.members = team.members.filter(val => !members.includes(val));
            await team.save();
        }
    }
    res.status(200).json({message:"Done successfully"})
});

// @desc    Get Logged user data
// @route   GET /api/v1/users/getMe
// @access  Private/Protect - user
exports.getLoggedUserData = asyncHandler(async (req, res, next) => {
    req.params.id = req.user._id;
    next();
});

// @desc    Update logged user password
// @route   PUT /api/v1/users/updateMyPassword
// @access  Private/Protect userModel - user
exports.updateLoggedUserPassword = asyncHandler(async (req, res, next) => {
    // 1) Update user password based user payload (req.user._id)
    const user = await userModel.findByIdAndUpdate(
        req.user._id,
        {
            password: await bcrypt.hash(req.body.password, 12),
            passwordChangedAt: Date.now(),
        },
        {
            new: true,
        }
    );
     // 2) Generate token
    const token = createtoken(user._id);
    res.status(200).json({ data: user , token });
});

  // @desc    Update logged user data (without password, role)
  // @route   PUT /api/v1/users/updateMe
  // @access  Private/Protect - user
exports.updateLoggedUserData = asyncHandler(async (req, res, next) => {
    const updatedUser = await userModel.findByIdAndUpdate(
        req.user._id,
        {
            name: req.body.name,
            email: req.body.email,
            phone: req.body.phone,
            profileImg: req.body.profile
        },
        { new: true }
    );
    res.status(200).json({ data: updatedUser });
});

  // @desc    Deactivate logged user
  // @route   DELETE /api/v1/users/deleteMe
  // @access  Private/Protect - user
exports.deleteLoggedUserData = asyncHandler(async (req, res, next) => {
    await userModel.findByIdAndUpdate(req.user._id, { active: false });
    res.status(204).json({ status: 'Success' });
})