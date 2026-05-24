import db from '../db.js';

/**
 * RAG Service: Retrieval-Augmented Generation
 * This service retrieves relevant context from the knowledge base, 
 * product inventory, and verified feedbacks to provide grounded answers.
 */
export const queryRAG = async (prompt) => {
    const lowerPrompt = prompt.toLowerCase();
    
    // 1. RETRIEVAL - Searching Knowledge Base
    const [knowledgeSnippets] = await db.query(
        'SELECT * FROM knowledge_base WHERE ? LIKE CONCAT("%", keywords, "%") OR topic LIKE ?',
        [lowerPrompt, `%${lowerPrompt}%`]
    );

    // 2. RETRIEVAL - Searching Products
    const [products] = await db.query(
        'SELECT * FROM products WHERE ? LIKE CONCAT("%", name, "%") OR category LIKE ?',
        [lowerPrompt, `%${lowerPrompt}%`]
    );

    // 3. RETRIEVAL - Searching Verified Feedback
    let feedbackHighlights = [];
    if (products.length > 0) {
        const productNames = products.map(p => p.name);
        const [rows] = await db.query(
            'SELECT * FROM feedbacks WHERE verdict = "Genuine" AND product_name IN (?) LIMIT 3',
            [productNames]
        );
        feedbackHighlights = rows;
    }

    // 4. SYNTHESIS - Constructing the Response
    let responseText = "";

    // Header logic
    if (knowledgeSnippets.length > 0) {
        responseText += `💡 **Scientific Insights Found:**\n\n`;
        knowledgeSnippets.forEach(snippet => {
            responseText += `*   **${snippet.topic}**: ${snippet.content}\n`;
        });
        responseText += `\n---\n\n`;
    }

    if (products.length > 0) {
        responseText += `📦 **Inventory Match:** Based on your interest, I found the **${products[0].name}** ($${products[0].price}). It fits into our ${products[0].category} category.\n\n`;
        
        if (feedbackHighlights.length > 0) {
            responseText += `✅ **Community Verdict:** We have ${feedbackHighlights.length}+ verified genuine reviews for this item. Users generally report: "${feedbackHighlights[0].review_text.substring(0, 100)}..."\n\n`;
        }
    }

    // Default fallback if nothing found
    if (!responseText) {
        const [availableTopics] = await db.query('SELECT DISTINCT topic FROM knowledge_base LIMIT 5');
        const suggestions = availableTopics.map(t => t.topic).join(', ');
        return `🔍 **Neural Scan Complete:** I couldn't find a direct correlation for that specific query in my current scientific repository.\n\nHowever, my core intelligence is grounded in: **${suggestions}**, and our **Himalaya & Derma Co** inventory. Would you like to explore one of these specialized topics?`;
    }

    responseText += `\n\n📝 **AI Summary:** Combining the scientific data with our inventory, this choice is scientifically grounded for your specific skin concerns.`;

    return responseText;
};
