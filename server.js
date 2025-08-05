const express = require('express');
const { GoogleGenerativeAI, HarmCategory, HarmBlockThreshold } = require('@google/generative-ai');
const dotenv = require('dotenv').config();

const app = express();
const port = process.env.PORT || 3000;
app.use(express.json());
const MODEL_NAME = "gemini-pro";
const API_KEY = process.env.GEMINI_API_KEY;

async function runChat(userInput) {
  const genAI = new GoogleGenerativeAI(API_KEY);
  const model = genAI.getGenerativeModel({ model: MODEL_NAME });

  const generationConfig = {
    temperature: 0.9,
    topK: 1,
    topP: 1,
    maxOutputTokens: 1000,
  };

  const safetySettings = [
    {
      category: HarmCategory.HARM_CATEGORY_HARASSMENT,
      threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE,
    },
    
  ];

  const chat = model.startChat({
    generationConfig,
    safetySettings,
    history: [
      {
        role: "user",
        parts: [{ text: "Hi, I need help with something." }]
      },
      {
        role: "model",
        parts: [{ text: "Hello! How’s your day going?" }]
      },
      {
        role: "user",
        parts: [{ text: "It’s going great, thanks!" }]
      },
      {
        role: "model",
        parts: [{ text: "That’s awesome to hear! If you could visit any country in the world, where would you go?" }]
      },
      {
        role: "user",
        parts: [{ text: "Hey Gemini, what’s your favorite color?" }]
      },
      {
        role: "model",
        parts: [{ text: "I love blue—it’s calm and peaceful! What about you?" }]
      },
      {
        role: "user",
        parts: [{ text: "I’m a fan of green, it’s very refreshing." }]
      },
      {
        role: "model",
        parts: [{ text: "Yes it looks like nature" }]
      }
      
      
    ]
  });

  try {
    const result = await chat.sendMessage(userInput);
    return result.response ? result.response.text() : "No response text available";
  } catch (error) {
    console.error("Error while sending message:", error);
    return "Sorry, there was an issue with processing your request.";
  }
}

app.get('/', (req, res) => {
  res.sendFile(__dirname + '/index.html');
});

app.get('/Loading.gif', (req, res) => {
  res.sendFile(__dirname + '/Loading.gif');
});

app.post('/chat', async (req, res) => {
  try {
    const userInput = req.body?.userInput;
    console.log('Incoming /chat request:', userInput);

    if (!userInput) {
      return res.status(400).json({ error: 'Invalid request body, user input missing' });
    }

    const response = await runChat(userInput);
    res.json({ response });
  } catch (error) {
    console.error('Error in chat endpoint:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

app.listen(port, () => {
  console.log(`Server listening on port ${port}`);
});
