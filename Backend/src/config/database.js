import mongoose from "mongoose";
import 'dotenv/config'

async function main() {
	const connectionString = process.env.DB_CONNECTION_STRING || process.env.DB_CONNCECTION_STRING;
	if (!connectionString) {
		throw new Error("Missing MongoDB connection string: set DB_CONNECTION_STRING in your environment");
	}

	try {
		await mongoose.connect(connectionString);
		// Lightweight connection state logs
		mongoose.connection.on('connected', () => {
			console.log('MongoDB connected');
		});
		mongoose.connection.on('error', (err) => {
			console.error('MongoDB connection error:', err);
		});
		mongoose.connection.on('disconnected', () => {
			console.warn('MongoDB disconnected');
		});
		return mongoose.connection;
	} catch (err) {
		console.error('MongoDB initial connection failed:', err);
		throw err;
	}
}

export default main;