const { check, body} = require('express-validator')
const {validatorMiddleware} = require("../../middlewares/validationMiddleWare")
const userModel = require('../../models/userModel');
const teamModel = require('../../models/teamModel');

exports.createTeamValidator = [
    check('title').notEmpty().withMessage('Title is required'),
    check('teamLeader').optional().custom(async (val, { req }) => {
        const teamLeader = await userModel.findById(val);
        if (!teamLeader || teamLeader.team) {
            throw new Error("Team Leader is already in  team or not defined");
        }
        if (teamLeader.role !== 'team leader') {
            throw new Error("User is not a team leader");
        }
        return true;
    }),
    check('members').optional().custom(async (val, { req }) => {
        const isDuplicate = val.some((value, index) => val.indexOf(value) !== index);
        if (isDuplicate) {
            throw new Error("There are duplicates in members");
        }
        await Promise.all(val.map(async (memberId) => {
            try {
                const member = await userModel.findById(memberId);
                if (!member || member.role !== 'member') {
                    throw new Error("Invalid member ID or not a member");
                } else if (member.team) {
                    throw new Error("Member is already in a team");
                }
            } catch (error) {
                console.error(error);
                throw error;
            }
        }));
        return true;
    }),
    validatorMiddleware,
];


exports.getTeamValidator = [
    check('id').isMongoId().withMessage('Invalid ID formate').notEmpty().withMessage('id required'),
    validatorMiddleware,
];

exports.updateTeamTitleValidator = [
    check('title').notEmpty().withMessage('title required').notEmpty().withMessage('id required'),
    validatorMiddleware,
];


exports.addMemberValidator = [
    check('id').isMongoId().withMessage('Invalid ID format').notEmpty().withMessage('ID required'),
    check('members').notEmpty().withMessage('Members required').custom(async (val , {req}) => {
        const isDuplicate = val.some((value, index) => val.indexOf(value) !== index);
    
        if (isDuplicate) {
            throw new Error("There are duplicates in members");
        }
        await Promise.all(val.map(async (memberId) => {
            try {
                const member = await userModel.findById(memberId);
                if (!member || member.role !== 'member') {
                    throw new Error("This is not a member or not found");
                } else if (member.team) {
                    throw new Error("This member in team");
                }
            } catch (error) {
                console.error(error);
                throw error;
            }
        }));
        return true;
    }),
    validatorMiddleware,
];


exports.addTeamLeaderValidator = [
    check('id').isMongoId().withMessage('Invalid Id format').notEmpty().withMessage('ID is required'),
    check('teamLeader').isMongoId().withMessage('Invalid Team Leader ID format').custom(async (val , { req }) => {
        const team= await teamModel.findById(req.params.id);
        if(!team ){
            throw new Error("team not found");
        }
        if(team.teamLeader){
            throw new Error("team Have Team Leader");
        }
        const teamLeader = await userModel.findById(val);
        if (!teamLeader || teamLeader.role !== 'team leader') {
            throw new Error("This is not a team leader");
        }
        if (teamLeader.team) {
            throw new Error("Team leader is already in a team");
        }
        return true;
    }),
    validatorMiddleware,
];

exports.deleteMemberValidator = [
    check('id').notEmpty().withMessage('ID is required'),
    check('members').notEmpty().withMessage('Members are required').custom(async (val, { req }) => {
        const isDuplicate = val.some((value, index) => val.indexOf(value) !== index);

        if (isDuplicate) {
            throw new Error("There are duplicates in members");
        }

        await Promise.all(val.map(async (memberId) => {
            try {
                const member = await userModel.findById(memberId);
                if (!member || member.role !== 'member') {
                    throw new Error("This is not a member");
                }
                if(!member.team) {
                    throw new Error("Member haven't team");
                }
                if (member.team.toString() !== req.params.id) {
                    throw new Error("This member is not from this team")
                }
            } catch (error) {
                console.error(error);
                throw error;
            }
        }));
        return true;
    }),
    validatorMiddleware,
];



exports.deleteTeamLeaderValidator = [
    check('id').isMongoId().withMessage('Invalid ID format').notEmpty().withMessage('ID is required'),
    check('teamLeader').isMongoId().withMessage('Invalid team leader ID format').custom(async (val, { req }) => {
        const teamLeader = await userModel.findById(val);
        if (!teamLeader || teamLeader.role !== 'team leader') {
            throw new Error("This is not a team leader");
        }
        if(!teamLeader.team) {
            throw new Error("team Leader haven't team");
        }
        if (teamLeader.team.toString() !== req.params.id) {
            throw new Error("The team leader is not from this team");
        }
        return true;
    }),
    validatorMiddleware,
];

exports.deleteTeamValidator = [
    check('id').isMongoId().withMessage('Invalid ID formate').notEmpty().withMessage('id required'),
    validatorMiddleware,
];
