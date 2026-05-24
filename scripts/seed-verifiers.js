import mysql from 'mysql2/promise';
import dotenv from 'dotenv';

dotenv.config();

const verifiers = [
    // The Derma Co
    { product: 'The Derma Co 1% Salicylic Acid Facewash', term: 'salicylic acid', category: 'ingredient' },
    { product: 'The Derma Co 1% Salicylic Acid Facewash', term: 'bha', category: 'scientific' },
    { product: 'The Derma Co 1% Salicylic Acid Facewash', term: 'sebum', category: 'clinical' },
    { product: 'The Derma Co 1% Salicylic Acid Facewash', term: 'pore', category: 'clinical' },
    { product: 'The Derma Co 1% Salicylic Acid Facewash', term: 'blackhead', category: 'problem' },
    { product: 'The Derma Co 1% Salicylic Acid Facewash', term: 'exfoliation', category: 'mechanism' },
    { product: 'The Derma Co 1% Salicylic Acid Facewash', term: 'unclog', category: 'mechanism' },
    { product: 'The Derma Co 1% Salicylic Acid Facewash', term: 'acne', category: 'problem' },
    { product: 'The Derma Co 1% Salicylic Acid Facewash', term: 'oil control', category: 'benefit' },

    // Himalaya
    { product: 'Himalaya Purifying Neem Facewash', term: 'neem', category: 'ingredient' },
    { product: 'Himalaya Purifying Neem Facewash', term: 'turmeric', category: 'ingredient' },
    { product: 'Himalaya Purifying Neem Facewash', term: 'antibacterial', category: 'scientific' },
    { product: 'Himalaya Purifying Neem Facewash', term: 'antiseptic', category: 'scientific' },
    { product: 'Himalaya Purifying Neem Facewash', term: 'pimple', category: 'problem' },
    { product: 'Himalaya Purifying Neem Facewash', term: 'herbal', category: 'nature' },
    { product: 'Himalaya Purifying Neem Facewash', term: 'soap-free', category: 'feature' },
    { product: 'Himalaya Purifying Neem Facewash', term: 'gentle', category: 'feature' },

    // Mamaearth
    { product: 'Mamaearth Ubtan Facewash', term: 'turmeric', category: 'ingredient' },
    { product: 'Mamaearth Ubtan Facewash', term: 'saffron', category: 'ingredient' },
    { product: 'Mamaearth Ubtan Facewash', term: 'walnut', category: 'ingredient' },
    { product: 'Mamaearth Ubtan Facewash', term: 'tan removal', category: 'benefit' },
    { product: 'Mamaearth Ubtan Facewash', term: 'brightening', category: 'benefit' },
    { product: 'Mamaearth Ubtan Facewash', term: 'glow', category: 'benefit' },
    { product: 'Mamaearth Ubtan Facewash', term: 'melanin', category: 'clinical' },
    { product: 'Mamaearth Ubtan Facewash', term: 'exfoliate', category: 'mechanism' }
];

async function seedVerifiers() {
    try {
        const connection = await mysql.createConnection({
            host: process.env.DB_HOST || '127.0.0.1',
            user: process.env.DB_USER || 'root',
            password: process.env.DB_PASSWORD || 'Kowsh@123',
            database: process.env.DB_NAME || 'ai_recommender'
        });

        console.log('Seeding scientific verifiers...');
        
        // Clear existing to avoid duplicates if run multiple times
        await connection.query('DELETE FROM product_scientific_verifiers');

        for (const v of verifiers) {
            await connection.query(
                'INSERT INTO product_scientific_verifiers (product_name, term, category) VALUES (?, ?, ?)',
                [v.product, v.term, v.category]
            );
        }

        console.log('Seeding complete!');
        await connection.end();
    } catch (error) {
        console.error('Error seeding verifiers:', error);
    }
}

seedVerifiers();
