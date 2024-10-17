import mongoose from "mongoose";

mongoose.set('strictQuery', false);

const connectionDB = async function () {
    try {
        const {connection} = await mongoose.connect(process.env.MONGODB_URI)
        if (connection) {
            console.log(`Connected to MONGODB database ${connection.host}`);
            
        } 
    } catch (error) {
        console.log(`MongoDB connection failed Error: ${error}`);
        process.exit(1);
        
    }
};

export default connectionDB;
