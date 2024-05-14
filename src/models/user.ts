import { USER_ROLE } from '@/enums';
import { Schema, model, models } from 'mongoose';
import bcrypt from 'bcryptjs';

const userSchema = new Schema(
  {
    name: { type: String, require: true },
    email: { type: String, require: true },
    password: { type: String, require: true, default: `${process.env.STAFF_DEFAULT_PASSWORD}` },
    role: { type: String, enum: USER_ROLE, require: true, default: USER_ROLE.STANDARD },
    otp_enabled: { type: Boolean, require: true, default: false },
    otp_auth_url: String,
    otp_base32: String,
    is_deleted: { type: Boolean, require: true, default: false },
    deleted_at: { type: Date },
    is_change_default_password: { type: Boolean, default: false },
  },
  { timestamps: true },
);

userSchema.pre('save', async function (next) {
  const user = this;
  if (user.isModified('password') || user.isNew) {
    user.password = await bcrypt.hash(user.password, 8);
  }
  next();
});

userSchema.methods.comparePassword = async function (password: string) {
  const user = this;
  return await bcrypt.compare(password, user.password);
};

const User = models.User || model('User', userSchema);
export default User;
