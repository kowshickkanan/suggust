import db from '../db.js';

async function checkDB() {
    try {
        const [products] = await db.query('SELECT id, name, category FROM products');
        console.log('--- PRODUCTS IN DB ---');
        console.table(products);

        const [keywords] = await db.query('SELECT * FROM product_keywords LIMIT 5');
        console.log('--- KEYWORDS IN DB (SAMPLED) ---');
        console.table(keywords);

        process.exit(0);
    } catch (error) {
        console.error('DB Check Failed:', error);
        process.exit(1);
    }
}

checkDB();
