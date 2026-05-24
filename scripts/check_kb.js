import db from '../db.js';

async function check() {
    try {
        const [rows] = await db.query('SELECT topic, content FROM knowledge_base');
        console.log(`Knowledge Base found with ${rows.length} entries.`);
        rows.forEach(r => console.log(`- ${r.topic}`));
        process.exit(0);
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
}
check();
