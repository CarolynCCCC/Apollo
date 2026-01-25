import dotenv from 'dotenv';

dotenv.config();

interface Config {
    port: number;
    nodeEnv: string;
    maxRooms: number;
    inactivityTimeout: number;
    inactivityWarning: number;
    cleanupInterval: number;
}

const config: Config = {
    port: Number(process.env.PORT) || 3000,
    nodeEnv: process.env.NODE_ENV || 'development',
    maxRooms: Number(process.env.MAX_ROOMS ?? 3),
    inactivityTimeout: Number(process.env.INACTIVITY_TIMEOUT) || 1800000,
    inactivityWarning: Number(process.env.INACTIVITY_WARNING) || 1500000,
    cleanupInterval: Number(process.env.CLEANUP_INTERVAL) || 300000,
};

export default config;