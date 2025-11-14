const OpenAI = require("openai");

if (!process.env.OPENAI_API_KEY) {
  throw new Error("Falta OPENAI_API_KEY en .env");
}

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

module.exports = { openai };
