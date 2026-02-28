import { connect } from "mongoose";
import { MONGODB_URI } from "./env.config.ts";
import dns from 'dns';

const secret = "mongodb://yemuel_db:nW28QCiBfNOA5wBm@ac-rugtqzn-shard-00-00.s84rfk9.mongodb.net:27017,ac-rugtqzn-shard-00-01.s84rfk9.mongodb.net:27017,ac-rugtqzn-shard-00-02.s84rfk9.mongodb.net:27017/?ssl=true&replicaSet=atlas-rugtqzn&authSource=admin&retryWrites=true&w=majority"

export const connectToDatabase = async () => {
    try {
        const secretUri = process.env.MONGODB_URI || secret;
        
        if (!secretUri) {
            throw new Error("MONGODB_URI is not defined");
        }
        
        console.log('Current DNS servers:', dns.getServers());
        console.log('Attempting to connect to MongoDB...');
        
        const conn = await connect(secretUri, {
            serverSelectionTimeoutMS: 30000,
            socketTimeoutMS: 45000,
            family: 4, // Force IPv4
        });
        // x
        console.log(`✅ Connected to MongoDB: ${conn.connection.host}`);
        return conn;
    } catch (error: any) {
        console.error('❌ Database connection error:', error);
        throw error;
    }
}