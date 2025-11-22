import dotenv from 'dotenv';

dotenv.config();

/**
 * AI Service Abstraction Layer
 * Supports multiple AI providers: OpenAI, Claude (Anthropic), Gemini, Ollama
 */

const AI_PROVIDER = process.env.AI_PROVIDER || 'openai';

/**
 * OpenAI Integration
 */
const callOpenAI = async (messages, systemPrompt) => {
    try {
        const { default: OpenAI } = await import('openai');

        const openai = new OpenAI({
            apiKey: process.env.OPENAI_API_KEY,
        });

        const response = await openai.chat.completions.create({
            model: process.env.OPENAI_MODEL || 'gpt-3.5-turbo',
            messages: [
                { role: 'system', content: systemPrompt },
                ...messages,
            ],
            temperature: 0.7,
            max_tokens: 500,
        });

        return response.choices[0].message.content;
    } catch (error) {
        console.error('OpenAI API error:', error.message);
        throw new Error('OpenAI service unavailable');
    }
};

/**
 * Claude (Anthropic) Integration
 */
const callClaude = async (messages, systemPrompt) => {
    try {
        const { default: Anthropic } = await import('@anthropic-ai/sdk');

        const anthropic = new Anthropic({
            apiKey: process.env.ANTHROPIC_API_KEY,
        });

        const response = await anthropic.messages.create({
            model: process.env.CLAUDE_MODEL || 'claude-3-haiku-20240307',
            max_tokens: 500,
            system: systemPrompt,
            messages: messages,
        });

        return response.content[0].text;
    } catch (error) {
        console.error('Claude API error:', error.message);
        throw new Error('Claude service unavailable');
    }
};

/**
 * Google Gemini Integration
 */
/**
 * Google Gemini Integration
 */
const callGemini = async (messages, systemPrompt) => {
    try {
        const { GoogleGenerativeAI } = await import('@google/generative-ai');

        const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
        // Use Gemini 1.5 Pro as requested (latest stable)
        const model = genAI.getGenerativeModel({
            model: process.env.GEMINI_MODEL || 'gemini-1.5-pro',
        });

        // If systemPrompt is provided, prepend it. 
        // If not (because it's already in the user message), just use messages.
        let prompt = '';

        if (systemPrompt) {
            prompt += `${systemPrompt}\n\n`;
        }

        // Combine conversation history
        const conversationText = messages
            .map((msg) => `${msg.role}: ${msg.content}`)
            .join('\n');

        prompt += `${conversationText}\n\nassistant:`;

        const result = await model.generateContent(prompt);
        const response = await result.response;
        return response.text();
    } catch (error) {
        console.error('Gemini API error:', error.message);
        throw new Error('Gemini service unavailable');
    }
};

/**
 * Ollama (Local LLM) Integration
 */
const callOllama = async (messages, systemPrompt) => {
    try {
        const ollamaUrl = process.env.OLLAMA_BASE_URL || 'http://localhost:11434';
        const model = process.env.OLLAMA_MODEL || 'llama2';

        const response = await fetch(`${ollamaUrl}/api/chat`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                model: model,
                messages: [
                    { role: 'system', content: systemPrompt },
                    ...messages,
                ],
                stream: false,
            }),
        });

        if (!response.ok) {
            throw new Error(`Ollama returned status ${response.status}`);
        }

        const data = await response.json();
        return data.message.content;
    } catch (error) {
        console.error('Ollama API error:', error.message);
        throw new Error('Ollama service unavailable. Make sure Ollama is running locally.');
    }
};

/**
 * Main AI service function
 * Routes to appropriate provider based on configuration
 */
export const generateAIResponse = async (messages, systemPrompt) => {
    try {
        switch (AI_PROVIDER.toLowerCase()) {
            case 'openai':
                return await callOpenAI(messages, systemPrompt);

            case 'claude':
            case 'anthropic':
                return await callClaude(messages, systemPrompt);

            case 'gemini':
            case 'google':
                return await callGemini(messages, systemPrompt);

            case 'ollama':
                return await callOllama(messages, systemPrompt);

            default:
                throw new Error(`Unsupported AI provider: ${AI_PROVIDER}`);
        }
    } catch (error) {
        console.error('AI service error:', error);
        throw error;
    }
};

/**
 * Generate fallback response when AI is not configured
 */
export const generateFallbackResponse = (intent, data = null) => {
    if (intent === 'product_search' && data?.products) {
        if (data.products.length === 0) {
            return "I couldn't find any products matching your search. Try different keywords or check the Products page to see all available items.";
        }

        const productList = data.products
            .map((p) => `• ${p.product_name} - Stock: ${p.stock_quantity}, Price: $${p.unit_price}`)
            .join('\n');

        return `Here are the products I found:\n\n${productList}\n\nWould you like more details about any of these?`;
    }

    if (intent === 'low_stock' && data?.products) {
        if (data.products.length === 0) {
            return "Great news! All products are currently well-stocked. No items need reordering at this time.";
        }

        const lowStockList = data.products
            .map((p) => `• ${p.product_name} - Current: ${p.stock_quantity}, Reorder Level: ${p.reorder_level}`)
            .join('\n');

        return `⚠️ Low Stock Alert!\n\nThe following items need attention:\n\n${lowStockList}\n\nConsider creating receipts to restock these items.`;
    }

    if (intent?.type === 'module_explanation' && data?.explanation) {
        const exp = data.explanation;
        return `📘 ${exp.title}\n\n${exp.description}\n\nKey Features:\n${exp.features.map((f) => `• ${f}`).join('\n')}\n\n💡 How to use: ${exp.usage}`;
    }

    if (intent === 'dashboard_summary' && data?.summary) {
        return `📊 Dashboard Summary\n\n• Total Products: ${data.summary.totalProducts}\n• Low Stock Items: ${data.summary.lowStockItems}\n• Recent Movements (7 days): ${data.summary.recentMoves}\n\nNeed help with anything specific?`;
    }

    return "I'm here to help! I can assist you with:\n\n• Finding products\n• Explaining modules (Receipts, Deliveries, Transfers, Adjustments)\n• Checking low stock alerts\n• Dashboard insights\n\nWhat would you like to know?";
};

export default {
    generateAIResponse,
    generateFallbackResponse,
};
