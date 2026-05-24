import db from '../db.js';

const scientificKnowledge = [
    {
        category: 'scientific',
        topic: 'Salicylic Acid Variant',
        sub_topic: 'Chemical Action',
        content: 'Contains Salicylic Acid (BHA), an oil-soluble exfoliant that penetrates pores and dissolves sebum buildup. It breaks down dead skin (keratolytic action) and reduces comedones (blackheads/whiteheads). Combined with Niacinamide for anti-inflammatory oil control and Cica/Allantoin for soothing. Limited bioavailability due to short contact duration.',
        keywords: 'salicylic acid, bha, sebum, keratolytic, comedones, blackheads, whiteheads, niacinamide'
    },
    {
        category: 'practical',
        topic: 'Salicylic Acid Variant',
        sub_topic: 'Clinical Utility',
        content: 'Suitable for oily/acne-prone skin; provides instant oil reduction. Good for mild acne maintenance but does not treat cystic/severe acne. Overuse may cause dryness. Works best when followed by a moisturizer/serum.',
        keywords: 'oily skin, cystic acne, dryness, maintenance'
    },
    {
        category: 'scientific',
        topic: 'Kojic Acid Variant',
        sub_topic: 'Depigmentation Pathways',
        content: 'Contains Kojic Acid (tyrosinase inhibitor) which reduces melanin synthesis. Paired with Alpha Arbutin for additional depigmenting and Niacinamid for tone correction. Targets hyperpigmentation pathways in superficial layers. Efficacy is limited due to rinse-off formulation.',
        keywords: 'kojic acid, tyrosinase, melanin, alpha arbutin, pigmentation, hyperpigmentation'
    },
    {
        category: 'practical',
        topic: 'Kojic Acid Variant',
        sub_topic: 'Tone Improvement',
        content: 'Suitable for dull skin and mild pigmentation. Improves tone slightly with regular use but does not remove deep pigmentation or melasma. Requires sunscreen for results. Best used alongside serums.',
        keywords: 'dull skin, melasma, sunscreen, brightness'
    },
    {
        category: 'scientific',
        topic: 'AHA + BHA Variant',
        sub_topic: 'Bimodal Exfoliation',
        content: 'Contains AHA (glycolic/lactic) for surface exfoliation and BHA (salicylic) for pore-level cleansing. Accelerates skin cell turnover and removes corneocyte buildup. Provides dual-action surface and pore cleaning. Reduced penetration due to wash-off nature.',
        keywords: 'aha, bha, glycolic, lactic, corneocyte, turnover, dual action'
    },
    {
        category: 'practical',
        topic: 'AHA + BHA Variant',
        sub_topic: 'Texture Smoothing',
        content: 'Ideal for dull/uneven textured skin. Produces instant smoothness and mild glow. Recommended 2–3 times/week only to avoid irritation. Not ideal for daily use on sensitive skin.',
        keywords: 'uneven texture, smoothness, glow, irritation, sensitive'
    },
    {
        category: 'clinical_logic',
        topic: 'Core AI Claims',
        sub_topic: 'Delivery Efficiency',
        content: 'Facewashes are low-contact systems (~30-60 sec). While active ingredients are scientifically valid, they have low delivery efficiency. Primary function is cleansing/maintenance, not primary treatment. Treatment-level results require leave-on formulations like serums or creams.',
        keywords: '60-second truth, delivery efficiency, cleansing vs treatment, serums vs facewash'
    }
];

async function ingest() {
    console.log('--- Starting Knowledge Ingestion ---');
    try {
        // Ensure table exists
        await db.query(`
            CREATE TABLE IF NOT EXISTS knowledge_base (
                id INT AUTO_INCREMENT PRIMARY KEY,
                category VARCHAR(50) NOT NULL,
                topic VARCHAR(100) NOT NULL,
                sub_topic VARCHAR(100),
                content TEXT NOT NULL,
                keywords TEXT,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        `);
        console.log('✔ Knowledge base table verified.');

        // Clear existing to avoid duplicates during dev
        await db.query('TRUNCATE TABLE knowledge_base');

        for (const item of scientificKnowledge) {
            await db.query(
                'INSERT INTO knowledge_base (category, topic, sub_topic, content, keywords) VALUES (?, ?, ?, ?, ?)',
                [item.category, item.topic, item.sub_topic, item.content, item.keywords]
            );
            console.log(`+ Ingested: ${item.topic}`);
        }

        console.log('--- Ingestion Complete ---');
        process.exit(0);
    } catch (err) {
        console.error('Ingetion failed:', err);
        process.exit(1);
    }
}

ingest();
