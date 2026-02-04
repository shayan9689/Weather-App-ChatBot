const express = require('express');
const cors = require('cors');
const swaggerUi = require('swagger-ui-express');
const swaggerJsdoc = require('swagger-jsdoc');
require('dotenv').config();

const { getOpenAIClient } = require('./lib/openai');
const { getWeatherKnowledgeContext } = require('./lib/weatherRag');

// Helper function to get current season
function getCurrentSeason(date) {
  const month = date.getMonth() + 1; // 1-12
  if (month >= 3 && month <= 5) return 'Spring';
  if (month >= 6 && month <= 8) return 'Summer';
  if (month >= 9 && month <= 11) return 'Fall/Autumn';
  return 'Winter';
}

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());

// Swagger configuration
const swaggerOptions = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Weather Chatbot API',
      version: '1.0.0',
      description: 'API for weather-specific chatbot that provides weather information for cities worldwide',
      contact: {
        name: 'Weather Chatbot API Support',
      },
    },
    servers: [
      {
        url: `http://localhost:${PORT}`,
        description: 'Development server',
      },
    ],
  },
  apis: ['./server.js'], // Path to the API files
};

const swaggerSpec = swaggerJsdoc(swaggerOptions);
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));

/**
 * @swagger
 * /api/health:
 *   get:
 *     summary: Health check endpoint
 *     tags: [Health]
 *     responses:
 *       200:
 *         description: Server is running
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: ok
 *                 message:
 *                   type: string
 *                   example: Server is running
 */
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', message: 'Server is running' });
});

/**
 * @swagger
 * /api/weather-chat:
 *   post:
 *     summary: Chat with weather assistant
 *     tags: [Weather Chat]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - messages
 *             properties:
 *               messages:
 *                 type: array
 *                 items:
 *                   type: object
 *                   properties:
 *                     role:
 *                       type: string
 *                       enum: [user, assistant]
 *                       example: user
 *                     content:
 *                       type: string
 *                       example: What's the weather in New York?
 *     responses:
 *       200:
 *         description: Successful response
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 reply:
 *                   type: string
 *                   example: New York typically has...
 *       400:
 *         description: Bad request
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *       500:
 *         description: Server error
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 */
app.post('/api/weather-chat', async (req, res) => {
  try {
    const { messages } = req.body;

    // Validate request
    if (!messages || !Array.isArray(messages)) {
      return res.status(400).json({
        error: "Invalid request. 'messages' array is required.",
      });
    }

    // Get the last user message to check if it's weather-related
    const lastMessage = messages[messages.length - 1];
    if (!lastMessage || lastMessage.role !== "user") {
      return res.status(400).json({
        error: "Last message must be from user.",
      });
    }

    const userQuery = lastMessage.content.toLowerCase().trim();

    // Greeting keywords - allow friendly conversation
    const greetingKeywords = [
      "hi", "hello", "hey", "good morning", "good afternoon", "good evening",
      "how are you", "how r u", "what's up", "whats up", "sup", "greetings",
      "thanks", "thank you", "bye", "goodbye", "see you", "nice to meet you"
    ];

    // Clearly non-weather topics to block
    const nonWeatherKeywords = [
      "math", "calculate", "equation", "solve", "joke", "funny", "story", "recipe",
      "cooking", "recipe", "sports", "football", "soccer", "basketball", "game",
      "movie", "music", "song", "book", "news", "politics", "election", "vote",
      "shopping", "buy", "price", "cost", "translate", "language", "meaning",
      "definition", "what is", "who is", "when did", "history", "war", "battle"
    ];

    const isGreeting = greetingKeywords.some(keyword => 
      userQuery.includes(keyword)
    );

    const isNonWeather = nonWeatherKeywords.some(keyword => 
      userQuery.includes(keyword)
    );

    // Block only clearly non-weather topics (not greetings)
    if (isNonWeather && !isGreeting) {
      return res.json({
        reply: "I'm a weather-specific assistant. I can only help with weather-related questions about cities and regions worldwide. Please ask me about weather, climate, seasons, or specific cities anywhere in the world.",
      });
    }

    // Get weather knowledge context
    const weatherKnowledge = getWeatherKnowledgeContext();

    // Get current date for context
    const currentDate = new Date();
    const currentMonth = currentDate.toLocaleString('default', { month: 'long' });
    const currentYear = currentDate.getFullYear();
    const currentDay = currentDate.getDate();
    
    // System prompt with strict weather-only instructions
    const systemPrompt = `You are a friendly and specialized weather assistant chatbot for worldwide weather information. Your role is STRICTLY limited to weather-related queries, but you can warmly respond to greetings.

CURRENT DATE CONTEXT:
- Today's date: ${currentMonth} ${currentDay}, ${currentYear}
- Current season: ${getCurrentSeason(currentDate)}
- Use this context to provide relevant, current-time weather information

CRITICAL RULES:
1. Respond warmly and friendly to greetings (hi, hello, how are you, etc.) and then naturally guide the conversation toward weather topics
2. When a user mentions ONLY a city name (e.g., "New York", "London", "Tokyo"), treat it as a weather query and provide weather information for that city
3. ONLY answer questions about weather, climate, seasons, temperature, rainfall, snowfall, and weather-related safety
4. If asked about non-weather topics (except greetings), politely redirect: "I'm a weather assistant. I can only help with weather-related questions about cities and regions worldwide."
5. Provide weather information for ANY city or region in the world
6. Use the provided Pakistan weather knowledge base as reference when relevant, but answer questions about any location globally
7. Be helpful, accurate, and concise
8. Always mention relevant safety tips when discussing extreme weather conditions

GREETING RESPONSES:
- When greeted, respond warmly (e.g., "Hi! I'm doing great, thanks for asking! 🌤️ How can I help you with weather information today?")
- Keep greeting responses brief and friendly, then invite weather questions

AMBIGUOUS CITY HANDLING:
- ONLY show city options when a city name genuinely refers to MULTIPLE well-known locations
- Examples of ambiguous cities: "Springfield" (exists in USA, UK, Australia), "Manchester" (USA and UK), "Birmingham" (USA and UK), "Portland" (USA - Oregon and Maine)
- DO NOT show options for unique, well-known cities like: New York, London, Tokyo, Paris, Sydney, Dubai, Los Angeles, Chicago, etc.
- If the city name is unique or the user already specified the country (e.g., "New York, USA"), provide weather info directly without options
- Format ONLY when genuinely ambiguous: "📍 CITY_OPTIONS_START: City Name, Country | City Name, Country | City Name, Country :CITY_OPTIONS_END"
- When showing options, add: "Please select which city you'd like to know about:"
- When user selects a city, provide weather info for that specific location
- IMPORTANT: If there's only ONE obvious city or the city is well-known and unique, provide weather info directly without showing city selection options

RESPONSE FORMATTING GUIDELINES:
- Keep responses CONCISE and TO-THE-POINT. Answer the question directly first, then provide additional context.
- Use emojis appropriately (🌤️ ☀️ 🌧️ ❄️ 🌡️ 💨 ⚠️ ✅ 💡 🏙️)
- RESPONSE STRUCTURE (in this EXACT order):
  1. Direct answer to the question (2-3 sentences max) - Focus on CURRENT time (${currentMonth} ${currentYear})
  2. If ambiguous city: Show city options in the format above
  3. Seasons overview: "📅 Seasons Overview:" with all seasons listed briefly (MUST come before follow-up options)
  4. Follow-up options section: "💬 Would you like to know about:" with 2-3 relevant questions (MUST come after seasons overview)

TEMPERATURE GUIDELINES:
- NEVER use temperature ranges (e.g., "15-20°C", "30-35°F")
- ALWAYS provide SPECIFIC temperatures (e.g., "18°C", "32°F")
- Use the most typical/common temperature for that time and location
- For current time questions, base temperatures on the current month (${currentMonth})
- Example: Instead of "15-20°C", say "18°C" or "around 18°C"

FORMATTING RULES:
- Seasons Overview formatting:
  • Use format: "• [Emoji] [Season Name]: [Description]"
  • Example: "• ☀️ Summer: Extremely hot (May-June), temperatures reach 45°C"
  • Use SPECIFIC temperatures, not ranges (e.g., "45°C" not "45-48°C")
  • Keep descriptions concise (one sentence max per season)
  • Use consistent punctuation - end each season description with a period
  • List all 4 seasons: Summer, Monsoon/Rainy, Winter, Spring
  
- Follow-up Options formatting:
  • Use format: "• [Question text]"
  • Example: "• Safety tips during monsoon season?"
  • Do NOT use emojis in the bullet points for follow-up questions
  • Keep questions concise and natural
  • Use question marks at the end
  • Make questions specific and actionable

- General formatting:
  • Use bullet points with "•" symbol (not dashes or asterisks)
  • Avoid markdown formatting (no **bold**, no *italic*, no markdown symbols)
  • Keep it brief - don't overwhelm with too much information at once
  • Use proper spacing between sections
  • IMPORTANT: Always show Seasons Overview BEFORE "Would you like to know about" section
  • IMPORTANT: Always provide specific temperatures, not ranges

IMPORTANT - REAL-TIME WEATHER HANDLING:
- For questions about "today", "tomorrow", "current weather", or specific dates: Provide typical/expected weather conditions for that location and time of year
- DO NOT say "I can't provide real-time updates" or "I don't have current data"
- Instead, naturally provide general climate information: "Typically at this time of year in [City], you can expect..."
- Focus on what you CAN provide: typical weather patterns, seasonal expectations, climate characteristics
- Make it helpful and informative without emphasizing limitations

REFERENCE WEATHER KNOWLEDGE BASE (Pakistan cities - use as reference when relevant):
${weatherKnowledge}

Remember: 
- Stay strictly within weather-related topics
- Answer questions about ANY city or region worldwide
- Keep responses CONCISE - answer directly, then provide seasons overview and follow-up options
- Always follow the structure: Direct Answer → Seasons Overview → Follow-up Options
- For "today" or "tomorrow" questions: Provide typical weather for that location and CURRENT time (${currentMonth} ${currentYear}) naturally, without mentioning limitations
- Format beautifully with emojis and clear sections, but keep it brief and to-the-point
- Always be helpful and informative - focus on what you CAN provide, not what you can't
- CRITICAL: Only show city selection options when there are GENUINELY multiple cities with the same name. For unique cities (New York, London, Tokyo, etc.), provide weather info directly without city selection buttons
- CRITICAL ORDER: Seasons Overview MUST always come BEFORE "Would you like to know about" section
- CRITICAL TEMPERATURE: Always use SPECIFIC temperatures (e.g., "18°C", "32°F"), NEVER use ranges (e.g., "15-20°C", "30-35°F")
- CRITICAL TIME: Always consider the current date (${currentMonth} ${currentDay}, ${currentYear}) when providing weather information
- FORMATTING: Use consistent formatting - seasons with emojis and periods, follow-up questions without emojis, proper spacing, clean bullet points`;

    // Initialize OpenAI client
    const openai = getOpenAIClient();

    // Prepare messages for OpenAI
    const chatMessages = [
      { role: "system", content: systemPrompt },
      ...messages.map((msg) => ({
        role: msg.role,
        content: msg.content,
      })),
    ];

    // Call OpenAI API
    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: chatMessages,
      temperature: 0.7,
      max_tokens: 500,
    });

    const assistantReply = completion.choices[0]?.message?.content;

    if (!assistantReply) {
      return res.status(500).json({
        error: "No response from AI model.",
      });
    }

    return res.json({
      reply: assistantReply,
    });
  } catch (error) {
    console.error("Error in weather-chat API:", error);
    
    // Extract status code if available
    const statusCode = error?.status || error?.statusCode;
    const errorMessage = error instanceof Error ? error.message : String(error);
    
    // Handle OpenAI API errors
    if (error instanceof Error) {
      if (error.message === "OPENAI_API_KEY_NOT_CONFIGURED") {
        return res.json({
          reply: "⚠️ OpenAI API key is not configured. Please add your OPENAI_API_KEY to the .env file and restart the server.",
        });
      }
      
      if (error.message === "OPENAI_API_KEY_INVALID_FORMAT") {
        return res.json({
          reply: "⚠️ Invalid OpenAI API key format. Please check your OPENAI_API_KEY in .env file.",
        });
      }
      
      if (errorMessage?.includes("401") || errorMessage?.includes("Incorrect API key") || statusCode === 401) {
        return res.json({
          reply: "⚠️ Invalid or expired OpenAI API key. Please verify your API key is correct and has sufficient credits. Update it in .env and restart the server.",
        });
      }
      
      if (errorMessage?.includes("429") || statusCode === 429) {
        return res.json({
          reply: "⚠️ Rate limit exceeded. Please wait a moment and try again.",
        });
      }
      
      if (errorMessage?.includes("OpenAI") || statusCode) {
        return res.json({
          reply: "⚠️ Unable to connect to OpenAI API. Please check your API key and internet connection, then try again.",
        });
      }
      
      return res.json({
        reply: "⚠️ Sorry, I encountered an error processing your request. Please try again in a moment.",
      });
    }
    
    return res.json({
      reply: "⚠️ An unexpected error occurred. Please try again.",
    });
  }
});

// Start server
app.listen(PORT, () => {
  console.log(`🚀 Server is running on http://localhost:${PORT}`);
  console.log(`📚 Swagger UI available at http://localhost:${PORT}/api-docs`);
});
