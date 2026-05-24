import fs from 'fs';
import path from 'path';
import mysql from 'mysql2/promise';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function seedData() {
    try {
        const connection = await mysql.createConnection({
            host: process.env.DB_HOST || '127.0.0.1',
            user: process.env.DB_USER || 'root',
            password: process.env.DB_PASSWORD || '',
            database: process.env.DB_NAME || 'ai_recommender',
            multipleStatements: true
        });

        const files = [
            '../../database/skincare_data.sql',
            '../../database/knowledge_data.sql'
        ];

        for (const file of files) {
            const filePath = path.join(__dirname, file);
            console.log(`Reading SQL from: ${filePath}`);
            if (fs.existsSync(filePath)) {
                const sql = fs.readFileSync(filePath, 'utf8');
                console.log(`Executing ${file}...`);
                await connection.query(sql);
            } else {
                console.warn(`File not found: ${filePath}`);
            }
        }

        console.log('Data seeded successfully!');
        await connection.end();
        process.exit(0);
    } catch (error) {
        console.error('Error seeding data:', error);
        process.exit(1);
    }
}

seedData();
