import { model, Schema } from "mongoose";
import bcrypt from 'bcryptjs'

const userSchema = new Schema({
    username : {
        type: String,
        required: true,
        unique: true,
        trim: true,
        min: 3,
        max: 10
    },
    email: {
        type: String,
        required: true,
        unique: true,
        trim: true,
        lowercase: true
    },
    password: {
        type: String,
        required: true,
        minLength: 6
    },
    avatar: {
        type: String,
        default: null
    },
    status: {
        type: String,
        enum: ['online', 'offline', 'away'],
        default: 'offline'
    },
    lastSeen: {
        type: Date,
        deault: Date.now
    }
}, {
    timestamps: true
})


userSchema.pre('save', async function(next) {
    if (!this.isModified('password')) return next()

    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
})

userSchema.methods.comparePassword = async function(candidatePassword: string): Promise<boolean> {
    return bcrypt.compare(candidatePassword, this.password);
}

const userModel = model('User', userSchema);

export default userModel;