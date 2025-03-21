import mongoose from 'mongoose';

export const connectMongoDB = async () => {
  const uri = process.env.MONGODB_URL;

  if (!uri) {
    throw new Error('Invalid environment variable: "MONGODB_URL"');
  }
  try {
    await mongoose.connect(uri);
  } catch (error) {}
};
