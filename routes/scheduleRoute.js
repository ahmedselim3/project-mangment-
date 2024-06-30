const express = require("express")
const {createScheduleValidator , getScheduleValidator ,
    updateScheduleValidator ,deleteScheduleValidator}=require("./../utils/validators/scheduleValidator")
const {createSchedule , getSchedules , getSchedule , updateSchedule ,deleteSchedule} = require("../services/scheduleService")

const authService =require("../services/authService")
const router = express.Router()

router.use(authService.protect)


router.route("/")
.get( authService.allowedTo('team leader' , 'member') ,getSchedules)
.post( authService.allowedTo('team leader'),createScheduleValidator,createSchedule);
router.route("/:id")
.get(authService.allowedTo('team leader' , 'member') , getScheduleValidator , getSchedule)
.put(authService.allowedTo('team leader') ,updateScheduleValidator,updateSchedule)
.delete(authService.allowedTo('team leader') ,deleteScheduleValidator,deleteSchedule)

module.exports = router