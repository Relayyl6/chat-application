import { model, Schema, HydratedDocument, Model } from "mongoose";
import bcrypt from 'bcryptjs'

type UserModel = Model<IUser, {}, IUserMethods>;
export type UserDocument = HydratedDocument<IUser, IUserMethods>;

const userSchema = new Schema<IUser, UserModel, IUserMethods>({
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
        default: Date.now
    }
}, {
    timestamps: true
})

userSchema.pre('save', async function(this: any, next: any) {
    if (!this.isModified('password')) return next()
    if (!this.isModified('avatar')) return next()

    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    this.avatar = `https://ui-avatars.com/api/?name=${this.username}&background=random&size=128`
    next();
})

userSchema.methods.comparePassword = async function(candidatePassword: string): Promise<boolean> {
    return bcrypt.compare(candidatePassword, this.password);
}

const userModel = model<IUser, UserModel>('User', userSchema);

export default userModel;