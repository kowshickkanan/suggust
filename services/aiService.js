import db from '../db.js';

// Mock AI Service for simulating natural language understanding and scoring logic.
export const processRecommendation = async (prompt) => {
    prompt = prompt.toLowerCase();

    // Simple extraction logic
    let budget = 10000; // max default
    const budgetMatch = prompt.match(/(under|max|budget)\s*\$?\s*(\d+)/i);
    if (budgetMatch) {
        budget = parseInt(budgetMatch[2], 10);
    } else {
        const numMatch = prompt.match(/\$?\s*(\d+)/);
        if (numMatch) budget = parseInt(numMatch[1], 10);
    }

    let categoryFilter = null;
    if (prompt.includes('laptop')) categoryFilter = 'Laptops';
    if (prompt.includes('phone') || prompt.includes('smartphone')) categoryFilter = 'Smartphones';
    if (prompt.includes('desktop') || prompt.includes('pc')) categoryFilter = 'Desktop PCs';
    if (prompt.includes('headphone')) categoryFilter = 'Headphones';
    if (prompt.includes('monitor')) categoryFilter = 'Monitors';
    if (prompt.includes('tablet')) categoryFilter = 'Tablets';
    // Broadened skincare detection
    if (prompt.match(/face|skin|acne|wash|pimp|dry|oily|glow/i)) categoryFilter = 'Skincare';

    // Step 1: Check for keyword matches in our intelligent database table
    const [keywordMatches] = await db.query(
        'SELECT DISTINCT product_name FROM product_keywords WHERE ? LIKE CONCAT("%", keyword, "%") OR keyword LIKE ?',
        [prompt, `%${prompt}%`]
    );

    // Fetch products
    let query = 'SELECT * FROM products';
    const params = [];
    const filterClauses = [];

    if (categoryFilter) {
        filterClauses.push('category = ?');
        params.push(categoryFilter);
    }

    if (keywordMatches.length > 0) {
        const names = keywordMatches.map(m => m.product_name);
        filterClauses.push('(' + names.map(() => 'name LIKE ?').join(' OR ') + ')');
        names.forEach(n => params.push(`%${n}%`));
    }

    if (filterClauses.length > 0) {
        query += ' WHERE ' + filterClauses.join(' OR ');
    } else if (prompt.length > 0) {
        return [];
    }

    const [products] = await db.query(query, params);

    // Mock Scoring Logic
    const recommendations = products.map(product => {
        let score = 50;
        let explanation = "A decent match for your needs.";
        let rejectReason = null;

        if (categoryFilter && product.category === categoryFilter) score += 20;

        if (product.price <= budget) {
            score += 20;
            explanation = `At $${product.price}, this fits nicely into your budget.`;
        } else {
            score -= 30;
            rejectReason = `Exceeds your budget by $${(product.price - budget).toFixed(2)}.`;
        }

        const featuresStr = JSON.stringify(product.features).toLowerCase();

        if (prompt.includes('gaming') && (featuresStr.includes('rtx') || featuresStr.includes('refresh_rate') || product.name.toLowerCase().includes('gaming'))) {
            score += 15;
            explanation += ' Excellent for gaming with dedicated hardware capabilities.';
        }
        if ((prompt.includes('battery') || prompt.includes('long lasting')) && featuresStr.includes('battery')) {
            score += 10;
            explanation += ' Provides strong battery performance for uninterrupted use.';
        }

        score = Math.min(Math.max(score, 10), 99);

        if (score >= 80) {
            explanation = `We highly recommend the ${product.name}. ` + explanation;
        } else if (score >= 60) {
            explanation = `The ${product.name} is a good option. ` + explanation;
        } else {
            rejectReason = rejectReason || "Doesn't fully align with your specific preferences.";
        }

        const relativityTags = [];
        if (product.price <= budget) relativityTags.push({ label: 'Budget Optimal', color: '#10b981' });
        if (prompt.includes('gaming') && (featuresStr.includes('rtx') || featuresStr.includes('refresh_rate'))) relativityTags.push({ label: 'Pro Gaming', color: '#6366f1' });
        if (prompt.includes('battery') && featuresStr.includes('battery')) relativityTags.push({ label: 'Power Efficient', color: '#f59e0b' });
        if (score > 85) relativityTags.push({ label: 'Neural Synergy', color: '#ec4899' });

        return {
            ...product,
            matchScore: score,
            explanation,
            rejectReason,
            relativityTags
        };
    });

    return recommendations
        .sort((a, b) => b.matchScore - a.matchScore)
        .slice(0, 5);
};
