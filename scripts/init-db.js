import fs from 'fs';
import path from 'path';
import mysql from 'mysql2/promise';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function initializeDB() {
    try {
        // Connect without a specific db first to create it if it doesn't exist
        console.log(`Connecting to MySQL as user: ${process.env.DB_USER}`);
        const connection = await mysql.createConnection({
            host: process.env.DB_HOST || '127.0.0.1',
            user: process.env.DB_USER || 'root',
            password: process.env.DB_PASSWORD || '',
            multipleStatements: true // Important for running multiple queries in one string
        });

        const schemaPath = path.join(__dirname, '../../database/schema.sql');
        console.log(`Reading SQL from: ${schemaPath}`);
        const sql = fs.readFileSync(schemaPath, 'utf8');

        console.log('Executing SQL script...');
        await connection.query(sql);

        console.log('Database initialized successfully!');
        await connection.end();
        process.exit(0);
    } catch (error) {
        console.error('Error initializing database:', error);
        process.exit(1);
    }
}

initializeDB();
