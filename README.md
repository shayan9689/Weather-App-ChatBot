# Weather Chatbot API - Node.js Backend

A weather-specific AI chatbot API built with Node.js and Express, designed to provide weather information, climate details, and safety tips for cities worldwide. The API is strictly locked to weather-related queries and uses OpenAI API with reference knowledge base.

## Features

- 🌤️ **Weather-Specific API**: Strictly handles weather-related queries only
- 🌍 **Worldwide Coverage**: Weather information for any city or region around the world
- 🤖 **AI-Powered**: Uses OpenAI GPT-4o-mini for intelligent responses
- 📚 **Reference Knowledge**: Built-in weather patterns for Pakistan cities as reference
- 📖 **Swagger UI**: Interactive API documentation for testing
- 🚀 **RESTful API**: Clean Express.js backend

## Tech Stack

- **Runtime**: Node.js
- **Framework**: Express.js
- **AI**: OpenAI API (GPT-4o-mini)
- **Documentation**: Swagger UI
- **Language**: JavaScript

## Prerequisites

- Node.js 18+ and npm
- OpenAI API key ([Get one here](https://platform.openai.com/api-keys))

## Installation

1. Clone the repository:
```bash
git clone <your-repo-url>
cd Weather-App-ChatBot
```

2. Install dependencies:
```bash
npm install
```

3. Set up environment variables:
   - Create `.env` file in the root directory
   - Add your OpenAI API key:
```bash
OPENAI_API_KEY=your_openai_api_key_here
PORT=3000
```

4. Start the server:
```bash
# Development mode (with auto-reload)
npm run dev

# Production mode
npm start
```

5. Access the API:
   - API Base URL: `http://localhost:3000`
   - Swagger UI: `http://localhost:3000/api-docs`
   - Health Check: `http://localhost:3000/api/health`

## Project Structure

```
Weather-App-ChatBot/
├── server.js              # Express server and API routes
├── lib/
│   ├── openai.js         # OpenAI client utility
│   └── weatherRag.js      # Weather knowledge base
├── .env                   # Environment variables (create this file)
├── package.json           # Dependencies
└── README.md             # Documentation
```

## API Endpoints

### Health Check
```
GET /api/health
```
Returns server status.

### Weather Chat
```
POST /api/weather-chat
Content-Type: application/json

{
  "messages": [
    { "role": "user", "content": "What's the weather in New York?" }
  ]
}
```

**Response:**
```json
{
  "reply": "New York typically has..."
}
```

## Swagger UI

Access interactive API documentation at:
```
http://localhost:3000/api-docs
```

The Swagger UI provides:
- Complete API documentation
- Interactive API testing
- Request/response schemas
- Try-it-out functionality

## Usage Examples

### Using cURL:
```bash
curl -X POST http://localhost:3000/api/weather-chat \
  -H "Content-Type: application/json" \
  -d '{
    "messages": [
      { "role": "user", "content": "What is the weather in Lahore?" }
    ]
  }'
```

### Using JavaScript (fetch):
```javascript
const response = await fetch('http://localhost:3000/api/weather-chat', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    messages: [
      { role: 'user', content: 'What is the weather in Tokyo?' }
    ]
  })
});

const data = await response.json();
console.log(data.reply);
```

### Using Postman:
1. Import the Swagger spec from `/api-docs`
2. Set method to POST
3. URL: `http://localhost:3000/api/weather-chat`
4. Body (raw JSON):
```json
{
  "messages": [
    { "role": "user", "content": "Tell me about London weather" }
  ]
}
```

## Environment Variables

| Variable | Description | Required |
|----------|-------------|----------|
| `OPENAI_API_KEY` | Your OpenAI API key | Yes |
| `PORT` | Server port (default: 3000) | No |

## API Features

- **Weather-Only**: Strictly handles weather-related queries
- **Worldwide Coverage**: Answers questions about any city globally
- **Greeting Support**: Responds warmly to greetings
- **City Detection**: Automatically detects city names in queries
- **Formatted Responses**: Beautifully formatted with emojis and sections
- **Error Handling**: Comprehensive error handling with user-friendly messages

## Restrictions

The API is **strictly limited** to weather-related queries. It will politely refuse to answer:
- Non-weather questions
- General knowledge queries
- Political or sports topics
- Any topic unrelated to weather

## Development

### Run in Development Mode:
```bash
npm run dev
```
Uses nodemon for auto-reload on file changes.

### Run in Production Mode:
```bash
npm start
```

## Testing

Use Swagger UI at `http://localhost:3000/api-docs` to test all endpoints interactively.

## License

MIT License

## Support

For issues or questions, please open an issue on GitHub.

---

Built with ❤️ using Node.js, Express, and OpenAI
