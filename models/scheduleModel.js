const mongoose = require('mongoose')

const scheduleSchema = new mongoose.Schema({
    lunch : String,
    coffeeBreak : String,
    groupMeeting:String,
    specialTime : [{
        title:String,
        time:String
    }],
    teamLeader : {
        type : mongoose.Schema.ObjectId,
        ref  : 'UserModel'
    },
    members: [{
        type : mongoose.Schema.ObjectId,
        ref  : 'UserModel'
    }],
    team:{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'teamModel',
        required: [true, 'team Id required'],
        }
},
{ timestamps: true })

module.exports = mongoose.model('scheduleModel', scheduleSchema);
