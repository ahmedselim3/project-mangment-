const mongoose = require('mongoose');
const userModel = require('./../models/userModel')
const taskSchema = new mongoose.Schema({
    title:String,
    description: {
        type: String,
        required: [true, 'description required'],
    },
    teamLeader: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'UserModel',
        required: [true, 'teamLeader Id required'],
    },
    member: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'UserModel',
    required: [true, 'member Id required'],
    },
    team:{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'teamModel',
        required: [true, 'team Id required'],
        },
    createdAt: {
        type: Date,
        default: Date.now,
    },
    deadline: Date,
    startDate: Date,
    priority : Number,
    taskImage : String,
    document : String,
    done:{
        type: Boolean,
        default: false,
    }
},{ timestamps: true });


const setImageUrl= (doc) =>{
    if(doc.taskImage){
        const imageUrl = `${process.env.BASE_URL}/task/${doc.taskImage}`
        doc.profileImg =imageUrl
    }
}

// findOne , findAll , update
taskSchema.post('init', (doc) => {
    setImageUrl(doc)
});

// Create
taskSchema.post('save', (doc) => {
    setImageUrl(doc)
});




// member
taskSchema.statics.calcProgressToMember = async function (memberId) {
    const allMemberTasks = await this.aggregate([{$match: { member: memberId }}])

    const completedMemberTasks = await this.aggregate([{$match: { member: memberId , done:true }}])
    const progress = (completedMemberTasks.length/(allMemberTasks.length || 1))*100
    const overdue = allMemberTasks.length-completedMemberTasks.length

    if(allMemberTasks){
        await userModel.findByIdAndUpdate({_id:memberId},
            {
                progress: progress,
                overdue:overdue
            },
            {new : true})
    }}
taskSchema.post('save', async function () {await this.constructor.calcProgressToMember(this.member)});
taskSchema.post('remove', async function () {await this.constructor.calcProgressToMember(this.member)});

// team leader
taskSchema.statics.calcProgressToTeam = async function (teamLeaderId) {
    
    const allTeamTasks = await this.aggregate([{$match: { teamLeader: teamLeaderId }}])

    const completedTeamTasks = await this.aggregate([{$match: { teamLeader: teamLeaderId , done:true }}]);

    const progress = (completedTeamTasks.length/(allTeamTasks.length || 1))*100

    const overdue = allTeamTasks.length-completedTeamTasks.length
    
    if(allTeamTasks){
        await userModel.findByIdAndUpdate({_id:teamLeaderId},
            {
                progress: progress,
                overdue:overdue
            },
            {new : true})
    }}
taskSchema.post('save', async function () {await this.constructor.calcProgressToTeam(this.teamLeader)});
taskSchema.post('remove', async function () {await this.constructor.calcProgressToTeam(this.teamLeader)});

module.exports= mongoose.model('Task', taskSchema)