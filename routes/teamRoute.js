const express = require("express")
const {createTeamValidator , getTeamValidator , updateTeamTitleValidator
    , deleteTeamValidator , addMemberValidator , addTeamLeaderValidator
    ,deleteMemberValidator ,deleteTeamLeaderValidator } =require("../utils/validators/teamValidator")
const {createTeam , getTeams, getTeam , getMyTeam ,
    updateTeamTitle, deleteTeam ,addMember,addTeamLeader,deleteMember , deleteTeamLeader} = require("../services/teamService")

const authService =require("../services/authService")
const router = express.Router()

router.use(authService.protect)

router.put('/addMember/:id', authService.allowedTo('manger') ,addMemberValidator,addMember);
router.put('/addTeamLeader/:id', authService.allowedTo('manger') ,addTeamLeaderValidator,addTeamLeader);
router.put('/deleteMember/:id', authService.allowedTo('manger') ,deleteMemberValidator,deleteMember);
router.put('/deleteTeamLeader/:id', authService.allowedTo('manger') ,deleteTeamLeaderValidator,deleteTeamLeader);

router.get('/getMyTeam', authService.allowedTo('team leader' , "member") ,getMyTeam);

router.route("/")
.get( authService.allowedTo('manger') ,getTeams)
.post( authService.allowedTo('manger'),
createTeamValidator,createTeam);
router.route("/:id")
.get(authService.allowedTo('manger') ,getTeamValidator, getTeam)
.put(authService.allowedTo('manger') ,
updateTeamTitleValidator,updateTeamTitle)
.delete(authService.allowedTo('manger') , deleteTeamValidator,deleteTeam)


module.exports = router