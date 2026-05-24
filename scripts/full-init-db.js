import fs from 'fs';
import path from 'path';
import mysql from 'mysql2/promise';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function initializeFullDB() {
    try {
        console.log(`Connecting to MySQL as user: ${process.env.DB_USER}`);
        const connection = await mysql.createConnection({
            host: process.env.DB_HOST || '127.0.0.1',
            user: process.env.DB_USER || 'root',
            password: process.env.DB_PASSWORD || '',
            multipleStatements: true
        });

        const sqlFiles = [
            'schema.sql',
            'knowledge_schema.sql',
            'feedback_schema.sql',
            'skincare_data.sql',
            'knowledge_data.sql',
            'update_keywords.sql'
        ];

        for (const file of sqlFiles) {
            const filePath = path.join(__dirname, '../../database', file);
            if (fs.existsSync(filePath)) {
                console.log(`Executing SQL from: ${file}`);
                const sql = fs.readFileSync(filePath, 'utf8');
                await connection.query(sql);
                console.log(`Successfully executed ${file}`);
            } else {
                console.warn(`File not found: ${file}`);
            }
        }

        console.log('Full database initialization complete!');
        await connection.end();
        process.exit(0);
    } catch (error) {
        console.error('Error during full database initialization:', error);
        process.exit(1);
    }
}

initializeFullDB();
