const mongoose = require('mongoose')

const teamSchema = new mongoose.Schema({
    title: { type: String, required: true },
    teamLeader: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'UserModel',
    },
    members:[{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'UserModel',
    }],
},{ timestamps: true })

module.exports = mongoose.model('teamModel', teamSchema);