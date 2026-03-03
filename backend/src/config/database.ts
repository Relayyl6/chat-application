import { connect } from "mongoose";
import { MONGODB_URI } from "./env.config";
import dns from 'dns';

export const connectToDatabase = async () => {
    try {
        const secretUri = MONGODB_URI;
        
        if (!secretUri) {
            throw new Error("MONGODB_URI environment variable is not defined. Please set it in .env.local");
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