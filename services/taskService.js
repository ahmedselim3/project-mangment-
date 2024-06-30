const asyncHandler = require('express-async-handler')

const Task = require("../models/taskModel")
const multer  = require('multer')
const path = require('path');
const ApiError = require("../utils/apiError")
const sharp = require('sharp');
const { v4: uuidv4 } = require('uuid')


const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'uploads/tasks');
    },
    filename: (req, file, cb) => {
        cb(null, Date.now() + path.extname(file.originalname));
    }
});

const multerFilter = (req, file, cb) => {
    const imageTypes = /jpeg|jpg|png/;
    const documentTypes = /pdf|doc|docx|xls|xlsx|txt|text/;
    const extname = imageTypes.test(path.extname(file.originalname).toLowerCase()) || documentTypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = imageTypes.test(file.mimetype) || documentTypes.test(file.mimetype);

    if (extname && mimetype) {
        cb(null, true);
    } else {
        cb(new ApiError('Only Images are allowed with taskImage and document with document', 400), false);
    }
};

const upload = multer({
    storage: storage,
    fileFilter: multerFilter
});

const uploadFiles = upload.fields([
    { name: 'taskImage', maxCount: 1 },
    { name: 'document', maxCount: 1 }
]);

const resizeImage = asyncHandler(async (req, res, next) => {
    if (!req.files || !req.files.taskImage) return next();

    const image = req.files.taskImage[0];
    const filename = `task-${uuidv4()}-${Date.now()}.jpeg`;

    await sharp(image.path)
        .resize(600, 600)
        .toFormat('jpeg')
        .jpeg({ quality: 90 })
        .toFile(`uploads/tasks/${filename}`);

    req.body.taskImage = filename;
    next();
});

// @desc Create Task
// @Route Post /api/v1/tasks
// @access Privet
const createTask = asyncHandler(async (req, res) => {
    req.body.team = req.user.team;
    req.body.teamLeader = req.user._id;
    if (req.files) {
        if (req.files.taskImage) req.body.taskImage = req.files.taskImage[0].filename;
        if (req.files.document) req.body.document = req.files.document[0].filename;
    }
    const task = await Task.create(req.body);
    res.status(200).json({ message: "Added Successfully", data: task });
});

// @desc Find some Tasks
// @Route Get /api/v1/tasks
// @access public
const getTasks =  asyncHandler(async (req , res ) => {
    const tasks = await Task.find({teamLeader:req.user._id})
    res.status(200).json({message :"Done Successfully" ,totalTasks:tasks.length,Tasks:tasks})
})

// @desc Find Task
// @Route Get /api/v1/tasks:id
// @access public
const getTask = asyncHandler(async (req , res ) => {
    const {id}=req.params;
    const task = await Task.find({_id:id})
    res.status(200).json({message :"Done Successfully" ,task:task})
})

const getTasksForOneMember = asyncHandler(async (req , res , next) =>{
    const {id} = req.params
    const startDate = new Date();
    startDate.setHours(0, 0, 0, 0);
    const endDate = new Date();
    endDate.setHours(23,59,59,999);
    const memberTasks = await Task.find({
        member: id,
        createdAt: {
            $gte: startDate,
            $lt: endDate,
        },
    })
    res.status(200).json({message :"Done Successfully" , totalTasks:memberTasks.length,Tasks :memberTasks })
})

const getDailyTasksTeam =asyncHandler(async (req, res , next) =>{
    const startDate = new Date()
    startDate.setHours(0, 0, 0, 0)
    const endDate = new Date()  // startDate < createdAt < endDate
    endDate.setHours(23,59,59,999)
    const memberTasks = await Task.find({
        teamLeader:req.user._id,
        createdAt: {
            $gte: startDate,
            $lt: endDate
        }
    })
    res.status(200).json({message :"Done Successfully" , totalTasks:memberTasks.length,Tasks :memberTasks })
})

// @desc Update Task
// @Route Put /api/v1/Task:id
// @access public [Update]

const updateTask = asyncHandler(async (req , res , next ) => {
    const {id} = req.params;
    const task = await Task.findByIdAndUpdate({_id : id} , {
        description : req.body.description ,
        title : req.body.title
    } , {new : true})
    if(!task){
        return next(new ApiError(`task Not Found` , 404))
    }
    res.status(200).json({message :"Done Successfully" , data:task})
})

// @desc Delete Task
// @Route Delete /api/v1/Task:id
// @access public

const deleteTask = asyncHandler(async (req , res , next) => {
    const {id} = req.params;
    const task = await Task.findByIdAndDelete(id)
    if(!task){
        return next(new ApiError(`task Not Found` , 404))
    }
    // Trigger "remove" event when update task
    task.remove();
    res.status(200).json({message :"Done Successfully"})
})

const completeTask = asyncHandler(async (req , res , next) => {
    const {id} = req.params;
    const task = await Task.findByIdAndUpdate({_id:id},{done:true},{new:true})
    res.status(200).json({message :"Done Successfully" , task : task})
})

const getMyTasks = asyncHandler(async (req, res, next) => {
        const today = new Date() 
        today.setHours(0, 0, 0, 0)
    const memberTasks = await Task.find({member: req.user._id , done:false , deadline: { $gte: today }});
    res.status(200).json({message :"Done Successfully" , totalTasks:memberTasks.length,Tasks :memberTasks });
})

const overdueTasks  = asyncHandler(async (req, res, next) => {
    const today = new Date();  // 4 < 5 
    today.setHours(0, 0, 0, 0) // deadline < today 
    const memberTasks = await Task.find({tramLeader: req.user._id , done:false , deadline: { $lt: today }});
    res.status(200).json({message :"Done Successfully" , overdueTasks:memberTasks.length ,Tasks :memberTasks });
})

const inProgress = asyncHandler(async (req, res, next) =>{
    const today = new Date()
    today.setHours(0, 0, 0, 0) //  createdAt < today // deadline >= today  // (createdAt < today < deadline)
    const memberTasks = await Task.find({tramLeader: req.user._id , done:false , createdAt: { $lt: today } ,deadline: { $gte: today }})
    res.status(200).json({message :"Done Successfully" , inProgress:memberTasks.length,Tasks :memberTasks })
})

const getCompletedTasks = asyncHandler(async (req, res, next) =>{
    const memberTasks = await Task.find({tramLeader: req.user._id , done:true})
    res.status(200).json({message :"Done Successfully" , completedTasks:memberTasks.length,Tasks :memberTasks })
})

module.exports= { createTask , getTasks , getTask , updateTask , 
                    deleteTask , getDailyTasksTeam ,getTasksForOneMember,getCompletedTasks ,
                    overdueTasks,getMyTasks,inProgress , completeTask ,uploadFiles ,resizeImage}

