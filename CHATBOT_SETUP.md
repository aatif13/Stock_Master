# AI Chatbot Setup Guide for StockMaster

This guide will help you configure and use the AI chatbot feature in your StockMaster inventory system.

## 🎯 Overview

The AI chatbot has been successfully integrated into your StockMaster application. It provides:
- **Product search** using natural language
- **Module explanations** (Receipts, Deliveries, Transfers, Adjustments, etc.)
- **Low-stock alerts** and inventory insights
- **Dashboard summaries** and analytics
- **General inventory guidance**

## 📦 What's Been Added

### Frontend Components
- ✅ `components/chat/ChatWidget.tsx` - Floating chat button (bottom-right)
- ✅ `components/chat/ChatPanel.tsx` - Sliding chat drawer
- ✅ `components/chat/ChatMessage.tsx` - Message display component
- ✅ `components/chat/ChatContext.tsx` - State management
- ✅ Updated `app/layout.tsx` - Integrated chat on all pages

### Backend Components
- ✅ `src/routes/chatbotRoutes.js` - API endpoint
- ✅ `src/controllers/chatbotController.js` - Request handler
- ✅ `src/services/aiService.js` - Multi-provider AI integration
- ✅ `src/utils/chatbotHelpers.js` - Helper functions
- ✅ Updated `src/app.js` - Registered chatbot routes
- ✅ Installed AI SDKs: `openai`, `@anthropic-ai/sdk`, `@google/generative-ai`

## 🚀 Quick Start

### Option 1: Use Without AI (Fallback Mode - Works Immediately!)

The chatbot works **right now** without any AI configuration! It uses intelligent rule-based responses.

**No setup needed** - just:
1. Open any page in your StockMaster app
2. Click the floating chat button (bottom-right)
3. Start asking questions!

**Example queries that work in fallback mode:**
- "Show me all products"
- "What products are low on stock?"
- "Explain the receipts module"
- "How do I create a delivery?"
- "Show me dashboard summary"

### Option 2: Enable AI Provider (Enhanced Responses)

For more intelligent, conversational responses, configure an AI provider:

## 🔧 AI Provider Configuration

### Choose Your Provider

You can use **one** of the following AI providers:

#### 1️⃣ OpenAI (GPT-3.5/GPT-4)

**Setup:**
1. Get API key from [platform.openai.com](https://platform.openai.com)
2. Add to `backend/.env`:
```env
AI_PROVIDER=openai
OPENAI_API_KEY=sk-your-api-key-here
OPENAI_MODEL=gpt-3.5-turbo
```

**Cost:** Pay-per-use (~$0.002 per 1K tokens for GPT-3.5)

---

#### 2️⃣ Claude (Anthropic)

**Setup:**
1. Get API key from [console.anthropic.com](https://console.anthropic.com)
2. Add to `backend/.env`:
```env
AI_PROVIDER=claude
ANTHROPIC_API_KEY=sk-ant-your-api-key-here
CLAUDE_MODEL=claude-3-haiku-20240307
```

**Cost:** Pay-per-use (~$0.25 per million tokens for Haiku)

---

#### 3️⃣ Google Gemini

**Setup:**
1. Get API key from [makersuite.google.com](https://makersuite.google.com/app/apikey)
2. Add to `backend/.env`:
```env
AI_PROVIDER=gemini
GEMINI_API_KEY=your-api-key-here
GEMINI_MODEL=gemini-pro
```

**Cost:** Free tier available, then pay-per-use

---

#### 4️⃣ Ollama (Local/Offline - FREE!)

**Setup:**
1. Install Ollama from [ollama.ai](https://ollama.ai)
2. Download a model: `ollama pull llama2`
3. Start Ollama: `ollama serve`
4. Add to `backend/.env`:
```env
AI_PROVIDER=ollama
OLLAMA_BASE_URL=http://localhost:11434
OLLAMA_MODEL=llama2
```

**Cost:** FREE! Runs locally on your machine

---

## 📝 Complete .env Configuration

Your `backend/.env` file should look like this (choose one provider):

```env
# Database
DATABASE_URL=postgresql://user:password@localhost:5432/stockmaster
JWT_SECRET=your-jwt-secret

# AI Chatbot - Choose ONE provider below
AI_PROVIDER=openai

# OpenAI (if using)
OPENAI_API_KEY=sk-your-key-here
OPENAI_MODEL=gpt-3.5-turbo

# Claude (if using)
# ANTHROPIC_API_KEY=sk-ant-your-key-here
# CLAUDE_MODEL=claude-3-haiku-20240307

# Gemini (if using)
# GEMINI_API_KEY=your-key-here
# GEMINI_MODEL=gemini-pro

# Ollama (if using)
# OLLAMA_BASE_URL=http://localhost:11434
# OLLAMA_MODEL=llama2
```

## 🔄 Restart Backend

After adding your AI configuration:

```bash
cd backend
# Stop the current dev server (Ctrl+C)
npm run dev
```

The chatbot will now use your chosen AI provider!

## 💬 Using the Chatbot

### Opening the Chat
- Click the floating **chat button** in the bottom-right corner of any page
- The chat panel will slide in from the right

### Example Queries

**Product Search:**
- "Show me all electronics"
- "Find products with 'laptop' in the name"
- "What products do you have?"

**Low Stock Alerts:**
- "Which products are running low?"
- "Show me items that need reordering"
- "Low stock alert"

**Module Help:**
- "Explain the receipts module"
- "How do I create a delivery?"
- "What are transfers used for?"
- "Tell me about adjustments"

**Dashboard Insights:**
- "Show me dashboard summary"
- "What are my inventory stats?"
- "Give me an overview"

**General Questions:**
- "How does this system work?"
- "What can you help me with?"
- "Guide me through creating a receipt"

### Chat Features
- **Auto-scroll** to latest messages
- **Clear chat** button (trash icon in header)
- **Loading indicators** while AI responds
- **Timestamps** on all messages
- **Press Enter** to send messages

## 🎨 Customization

### Change Chat Position
Edit `components/chat/ChatWidget.tsx`:
```tsx
// Change from bottom-right to bottom-left
className="fixed bottom-6 left-6 ..."
```

### Change Chat Colors
Edit `components/chat/ChatPanel.tsx`:
```tsx
// Header gradient
className="bg-gradient-to-r from-blue-500 to-purple-600 ..."
```

### Adjust AI Response Length
Edit `backend/src/services/aiService.js`:
```javascript
max_tokens: 500, // Increase for longer responses
```

## 🧪 Testing

### Test Backend API Directly
```bash
curl -X POST http://localhost:5000/api/chatbot \
  -H "Content-Type: application/json" \
  -d '{"message": "Show me all products"}'
```

### Test in Browser
1. Open DevTools (F12)
2. Go to Console tab
3. Send test message:
```javascript
fetch('http://localhost:5000/api/chatbot', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ message: 'Hello!' })
}).then(r => r.json()).then(console.log)
```

## 🐛 Troubleshooting

### Chat button not appearing
- Check browser console for errors
- Verify frontend dev server is running: `npm run dev`
- Clear browser cache and reload

### "Backend unavailable" error
- Ensure backend is running on port 5000
- Check `http://localhost:5000/health` returns OK
- Verify CORS is enabled in `backend/src/app.js`

### AI responses not working
- Check AI provider is set in `.env`
- Verify API key is correct
- Check backend console for error messages
- Fallback responses will work even if AI fails

### Ollama connection error
- Ensure Ollama is running: `ollama serve`
- Check Ollama is on port 11434
- Verify model is downloaded: `ollama list`

## 📊 Performance Tips

1. **Use GPT-3.5** instead of GPT-4 for faster, cheaper responses
2. **Use Claude Haiku** for cost-effective responses
3. **Use Ollama** for free, offline operation (slower but private)
4. **Limit conversation history** to last 5 messages (already configured)

## 🔒 Security Notes

- API keys are stored in `.env` (never commit to git)
- `.env` is already in `.gitignore`
- Chatbot has read-only access to database
- No authentication required for chatbot (same as dashboard)

## 🎉 You're All Set!

The chatbot is now fully integrated and ready to use. It will:
- ✅ Appear on every page
- ✅ Work immediately in fallback mode
- ✅ Use AI when configured
- ✅ Never break existing functionality
- ✅ Provide helpful inventory assistance

**Need help?** Just ask the chatbot: "What can you help me with?"

---

## 📚 Additional Resources

- [OpenAI API Docs](https://platform.openai.com/docs)
- [Claude API Docs](https://docs.anthropic.com)
- [Gemini API Docs](https://ai.google.dev/docs)
- [Ollama Documentation](https://ollama.ai/docs)

**Enjoy your new AI assistant! 🤖**
