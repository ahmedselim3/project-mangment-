const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');


const userSchema = new mongoose.Schema(
{
    name: {
        type: String,
        trim: true,
        required: [true, 'name required'],
    },
    email: {
        type: String,
        required: [true, 'email required'],
        unique: true,
        lowercase: true,
        trim: true,
    },
    phone: String,
    profileImg: {type:String , default: 'uploads/users/default-profile.png'},
    password: {
        type: String,
        required: [true, 'password required'],
        minlength: [6, 'Too short password'],
    },
    passwordChangedAt : Date,
    passwordResetCode: String,
    passwordResetExpires: Date,
    passwordResetVerified: Boolean,
    role: {
        type: String,
        enum: ['member', 'team leader', 'manger'],
        default: 'manger',
    },
    team:String,
    progress:Number,
    overdue:Number,
    active: {
        type: Boolean,
        default: true,
    },
},
    { timestamps: true }
);

const setImageUrl= (doc) =>{
    if(doc.profileImg){
        const imageUrl = `${process.env.BASE_URL}/users/${doc.profileImg}`
        doc.profileImg =imageUrl
    }
}

// findOne , findAll , update
userSchema.post('init', (doc) => {
    setImageUrl(doc)
});

// Create
userSchema.post('save', (doc) => {
    setImageUrl(doc)
});


userSchema.pre('save', async function (next) {
    if (!this.isModified('password')) return next();
    // Hashing user password
    this.password = await bcrypt.hash(this.password, 12);
    next();
});

module.exports = mongoose.model('UserModel', userSchema);
