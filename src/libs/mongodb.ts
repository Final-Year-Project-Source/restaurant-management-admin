import mongoose from 'mongoose';

export const connectMongoDB = async () => {
  const uri = process.env.MONGODB_URI;

  if (!uri) {
    throw new Error('Invalid environment variable: "MONGODB_URI"');
  }
  try {
    await mongoose.connect(uri);
  } catch (error) {
    console.log('Error connecting to MongoDB: ', error);
  }
};
