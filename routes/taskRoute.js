const express = require("express")
const {createTaskValidator ,getTaskValidator  ,updateTaskValidator , deleteTaskValidator ,completeTaskValidator , getTasksForMemberValidator} =require("../utils/validators/taskValidator")
const {getTasks , createTask , getTask , updateTask ,
    deleteTask ,getMyTasks,getTasksForOneMember ,completeTask ,
    getDailyTasksTeam ,overdueTasks, getCompletedTasks ,inProgress , uploadFiles , resizeImage} = require("../services/taskService")
const Authorization = require("../services/authService")

const router = express.Router()

router.use(Authorization.protect)

router.get("/getMyTasks/" , Authorization.allowedTo('member') ,getMyTasks)

router.get("/getTasksForOneMember/:id" , Authorization.allowedTo('team leader') ,getTasksForMemberValidator,getTasksForOneMember)

router.get("/getDailyTasksTeam/" , Authorization.allowedTo('team leader') ,getDailyTasksTeam)

router.get("/getCompletedTasks/" , Authorization.allowedTo('team leader') ,getCompletedTasks)

router.get("/overdueTasks/" , Authorization.allowedTo('team leader') ,overdueTasks)

router.get("/inProgress/" , Authorization.allowedTo('team leader') ,inProgress)

router.put("/completeTask/:id" , Authorization.allowedTo('member') ,completeTaskValidator , completeTask)

router.route("/")
.get(Authorization.allowedTo('team leader'),getTasks)
.post(Authorization.allowedTo('team leader') ,uploadFiles ,resizeImage ,createTaskValidator,createTask);

router.route("/:id")
.get(getTaskValidator, getTask)
.put(Authorization.allowedTo('team leader'),uploadFiles ,resizeImage ,updateTaskValidator,updateTask)
.delete(Authorization.allowedTo('team leader') ,deleteTaskValidator,deleteTask)

module.exports = router