import {
    searchProducts,
    getLowStockProducts,
    getDashboardSummary,
    getModuleExplanation,
    getProductStock,
    getOutOfStockProducts,
    getProductReorderLevel,
    getProductsByCategory,
    getTodayStockSummary,
    buildSystemPrompt,
    detectIntent,
} from '../utils/chatbotHelpers.js';
import { generateAIResponse, generateFallbackResponse } from '../services/aiService.js';

/**
 * Handle chatbot message
 * POST /api/chatbot
 */
export const handleChatMessage = async (req, res) => {
    try {
        const { message, conversationHistory = [] } = req.body;

        if (!message || typeof message !== 'string') {
            return res.status(400).json({
                success: false,
                error: 'Message is required',
            });
        }

        const lowerMessage = message.toLowerCase();
        let dbData = null;
        let intent = 'general';

        // 1. Intent Detection & Data Fetching

        // "How much stock is left for X?"
        if (lowerMessage.includes('how much stock') || lowerMessage.includes('stock for')) {
            const productName = message.replace(/how much stock.*for|stock for/gi, '').trim();
            dbData = await getProductStock(productName);
            intent = 'stock_check';
        }
        // "List all out-of-stock products"
        else if (lowerMessage.includes('out of stock') || lowerMessage.includes('no stock')) {
            dbData = await getOutOfStockProducts();
            intent = 'out_of_stock';
        }
        // "What is the reorder level for X?"
        else if (lowerMessage.includes('reorder level')) {
            const productName = message.replace(/reorder level.*for/gi, '').trim();
            dbData = await getProductReorderLevel(productName);
            intent = 'reorder_level';
        }
        // "Show me all Electronics products"
        else if (lowerMessage.includes('show me all') && lowerMessage.includes('products')) {
            const category = message.replace(/show me all|products/gi, '').trim();
            dbData = await getProductsByCategory(category);
            intent = 'category_search';
        }
        // "Give today's stock summary"
        else if (lowerMessage.includes('today') && lowerMessage.includes('summary')) {
            dbData = await getTodayStockSummary();
            intent = 'daily_summary';
        }
        // "Show me low stock items"
        else if (lowerMessage.includes('low stock')) {
            dbData = await getLowStockProducts();
            intent = 'low_stock';
        }
        // Product search (fallback)
        else if (lowerMessage.includes('find') || lowerMessage.includes('search')) {
            const query = message.replace(/find|search/gi, '').trim();
            dbData = await searchProducts(query);
            intent = 'product_search';
        }
        // Module explanation
        else if (lowerMessage.includes('explain') || lowerMessage.includes('how to')) {
            const modules = ['receipt', 'delivery', 'transfer', 'adjustment', 'product', 'dashboard', 'history'];
            for (const module of modules) {
                if (lowerMessage.includes(module)) {
                    dbData = getModuleExplanation(module);
                    intent = 'module_explanation';
                    break;
                }
            }
        }
        // Dashboard summary
        else if (lowerMessage.includes('dashboard')) {
            dbData = await getDashboardSummary();
            intent = 'dashboard_summary';
        }

        // 2. Construct Prompt
        const dataString = dbData ? JSON.stringify(dbData, null, 2) : "No specific database data found for this query.";

        const systemPrompt = `You are a StockMaster inventory assistant.
Here is real database data:

${dataString}

User question:
${message}

Answer based ONLY on the real data.
If the user asks something not in the database, say:
"That information is not available in the system."`;

        // 3. Call AI Service
        let reply;
        try {
            // Build conversation history for context
            const messages = [
                ...conversationHistory.slice(-5).map((msg) => ({
                    role: msg.role,
                    content: msg.content,
                })),
                { role: 'user', content: systemPrompt } // Send the full prompt as the user message
            ];

            // Check for API key
            const hasApiKey = process.env.GEMINI_API_KEY || process.env.OPENAI_API_KEY || process.env.ANTHROPIC_API_KEY;

            if (hasApiKey) {
                // For Gemini/others, we send the constructed prompt
                // Note: We pass an empty system prompt here because we embedded it in the user message
                // as per the specific template request
                reply = await generateAIResponse(messages, "");
            } else {
                reply = generateFallbackResponse(intent, { products: dbData, explanation: dbData, summary: dbData });
            }
        } catch (error) {
            console.error('AI generation error:', error);
            reply = generateFallbackResponse(intent, { products: dbData, explanation: dbData, summary: dbData });
        }

        return res.status(200).json({
            success: true,
            reply,
            intent
        });

    } catch (error) {
        console.error('Chatbot controller error:', error);
        return res.status(500).json({
            success: false,
            error: 'Internal server error',
            message: error.message,
        });
    }
};

export default {
    handleChatMessage,
};
