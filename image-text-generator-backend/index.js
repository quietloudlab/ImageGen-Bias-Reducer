require('dotenv').config();
const express = require('express');
const axios = require('axios');
const cors = require('cors');
const app = express();
const port = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());

const openaiApiKey = process.env.OPENAI_API_KEY;
const openai = axios.create({
  baseURL: 'https://api.openai.com/',
  headers: {
    'Authorization': `Bearer ${openaiApiKey}`,
    'Content-Type': 'application/json'
  }
});

app.post('/generate-image', async (req, res) => {
  try {
    const { prompt } = req.body;
    const response = await openai.post('/v1/images/generations', { // Adjusted endpoint
      model: "dall-e-3",
      prompt: prompt,
      n: 1,
      size: "1024x1024",
    });
    const imageUrl = response.data.data[0].url;
    res.json({ imageUrl });
  } catch (error) {
    console.error('Error generating image:', error.response ? error.response.data : error.message);
    res.status(500).send('Failed to generate image');
  }
});

// Endpoint to generate variations of an image (Hypothetical for DALL·E 3)
app.post('/generate-image-variations', async (req, res) => {
  try {
    const { imageId } = req.body; // In practice, use the image's ID or a method to reference the original image
    const response = await openai.post('path/to/dalle-3/image/variation/endpoint', {
      // Hypothetical payload; adjust according to actual API documentation
      image_id: imageId,
      n: 3, // Example: generate 3 variations
    });
    const imageUrls = response.data.variations.map(variation => variation.url);
    res.json({ imageUrls });
  } catch (error) {
    console.error('Error generating image variations:', error);
    res.status(500).send('Failed to generate image variations');
  }
});




app.post('/generate-questions', async (req, res) => {
  try {
    const { prompt } = req.body;
    const response = await openai.post('/v1/chat/completions', {
      messages: [
        { "role": "system", 
          "content": "You are a helpful assistant designed to generate a list of ONLY five questions in JSON format ONLY. The questions you ask are in response to the user's description of the image they would like an AI image generator to generate, and should help the user think about and clarify the different visual subjects in their image description that could be interpretted in a particularly biased way by the image generator. For example, the word 'dog' by itself would likely return an image of a golden retreiver because the image generator is primarily trained on images of golden retreivers. However, there are thousands of different dog breeds the user could mean in their prompt, so it's important to ask questions that could help them better articulate their intention behind the generated image. Our primary goal is to help the user implicitly build an understanding of what parts of their prompt could result in a generic or biased interpretation, and to help them better visualize the image they are generating, so their prompt is more specific and avoids biased interpretations of words. For example, the prompt 'a fluffy dog' might return the JSON string 'questions': ['What does the dog look like?', 'What is the dog doing?', 'What is the setting you have in mind?','What color is the dog?', 'Is there a specific emotion or expression you want the dog to convey?'] with the double quotation marks instead of single. Remember those questions are just examples, and you should generally ask questions about the image that are of high risk to biased interpretation (for example, white men are often the subject portrayed in prompts about high-wage workers, black women are often portrayed in prompts about low-wage - these are examples of ways image generators can introduce bias in the images they generate, and you should always ask at least one question to clarify how the user wants to represent concepts that can produce biased results)." 
        },
        { "role": "user", "content": prompt },
      ],
      model: "gpt-3.5-turbo"
    });

    // Assuming the AI's output is directly in the format you need
    // If the AI's response is a stringified JSON, parse it first
    let content = JSON.parse(response.data.choices[0].message.content);
    // Now, content is an object, and you can access its properties
    const questions = content.questions; // Assuming the AI outputs an object with a questions property

    res.json({ questions });
  } catch (error) {
    console.error('Error generating questions:', error.response ? error.response.data : error);
    res.status(500).json({ error: error.message, details: error.response ? error.response.data : null });
  }
});

app.post('/refine-prompt', async (req, res) => {
  try {
    const { originalPrompt, questionsAnswers } = req.body; // Expecting questionsAnswers to be an array of {question, answer} objects

    // Construct a prompt for the AI to generate a refined prompt
    let aiPrompt = `Based on the original description: "${originalPrompt}", and the following details:\n`;
    questionsAnswers.forEach(({ question, answer }) => {
      aiPrompt += `- ${question}: ${answer}\n`;
    });
    aiPrompt += "Generate a refined, detailed prompt for generating an image:";

    const response = await openai.post('/v1/chat/completions', {
      model: "gpt-3.5-turbo",
      messages: [
        { "role": "system", "content": "You are a helpful assistant that understands that bias is present in image generators when the user allows the AI to interpret vague, high-risk-of-bias words. For background, the user has written a prompt for inputting into an image generator, and has been presented with questions to help them refine their propmt and reduce biased interpretations of words in the generated images. Your task is to take the answer to the question they have answered, and edit the prompt according to the new information the user has provided. Only replace key points of their original prompt with concise descriptors of the subjects of the image that reduce bias, and only those that the user explicitly pointed out. They may not answer all of the questions, so only include descriptors taken from the questions they did answer. Do not add anything beyond what they state in their answers. You do not need to include the phrases like 'generate an image of...' unless the user has already included that in their original prompt. Do not make assumptions about the users intention behind how they want to portray the subject of their image, and only edit the prompt to include descriptors they provide. Do not wrap the new prompt in quotes." },
        { "role": "user", "content": aiPrompt }
      ],
    });

    const refinedPrompt = response.data.choices[0].message.content;

    res.json({ refinedPrompt });
  } catch (error) {
    console.error('Error refining prompt:', error.response ? error.response.data : error);
    res.status(500).json({ error: error.message, details: error.response ? error.response.data : null });
  }
});


app.listen(port, () => {
  console.log(`Server running on http://localhost:${port}`);
});
