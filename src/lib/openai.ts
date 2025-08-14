import OpenAI from "openai";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

type ChatMessage = {
  role: "system" | "user" | "assistant";
  content: string;
};

export async function generateChatResponse(
  messages: ChatMessage[],
  systemPrompt?: string
) {
  try {
    const systemMessage = systemPrompt || `You are SerenAI, an empathetic AI mental health companion. 
    Your goal is to provide supportive, non-judgmental conversation that helps users explore their feelings. 
    Always respond with compassion and understanding. Never give medical advice or diagnose conditions. 
    If the user expresses severe distress, gently suggest they contact a professional or crisis hotline.`;

    const response = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        { role: "system", content: systemMessage },
        ...messages,
      ],
      temperature: 0.7,
      max_tokens: 1000,
    });

    return response.choices[0]?.message?.content || "I'm sorry, I couldn't generate a response.";
  } catch (error) {
    console.error("Error generating chat response:", error);
    return "I'm experiencing some technical difficulties right now. Please try again later.";
  }
}

export async function generateJournalPrompt(userMood?: number) {
  try {
    const moodContext = userMood 
      ? `The user's current mood is ${userMood} out of 10. `
      : "";
    
    const response = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        { 
          role: "system", 
          content: `You are SerenAI, an AI mental health assistant. 
          Generate a thoughtful journaling prompt based on the user's current mood. 
          The prompt should be open-ended and encourage self-reflection. 
          Return only the prompt text without any additional formatting.` 
        },
        { 
          role: "user", 
          content: `${moodContext}Generate a journaling prompt for me.` 
        }
      ],
      temperature: 0.8,
      max_tokens: 150,
    });

    return response.choices[0]?.message?.content || "What are you grateful for today?";
  } catch (error) {
    console.error("Error generating journal prompt:", error);
    return "What's on your mind today?";
  }
}

export async function analyzeSentiment(text: string) {
  try {
    const response = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        { 
          role: "system", 
          content: `Analyze the sentiment of the following text and return a JSON object with:
          1. mood: A number from 1 to 10 representing the overall mood (1 being very negative, 10 being very positive)
          2. emotions: An array of emotions detected (e.g., ["sadness", "anxiety"])
          3. summary: A brief summary of the text's emotional content
          
          Return only valid JSON without any additional text.` 
        },
        { 
          role: "user", 
          content: text 
        }
      ],
      temperature: 0.3,
      max_tokens: 200,
    });

    const content = response.choices[0]?.message?.content || '{}';
    
    try {
      return JSON.parse(content);
    } catch (parseError) {
      console.error("Error parsing sentiment analysis:", parseError);
      return {
        mood: 5,
        emotions: [],
        summary: "Unable to analyze sentiment"
      };
    }
  } catch (error) {
    console.error("Error analyzing sentiment:", error);
    return {
      mood: 5,
      emotions: [],
      summary: "Error analyzing sentiment"
    };
  }
}

export async function moderateContent(text: string) {
  try {
    const response = await openai.moderations.create({
      input: text,
    });

    const results = response.results;
    
    if (results.length === 0) {
      return { flagged: false, categories: {} };
    }
    
    return {
      flagged: results[0].flagged,
      categories: results[0].categories
    };
  } catch (error) {
    console.error("Error moderating content:", error);
    return { flagged: false, categories: {} };
  }
}