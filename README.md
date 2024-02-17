# Image Generation Bias Mitigation Tool

This project aims to mitigate bias in AI-generated images by refining user prompts through a series of questions intended to clarify and specify the desired output. It utilizes OpenAI's API to generate images and refine prompts based on user feedback.

## Features

- **Prompt Refinement**: Dynamically generates questions based on an initial prompt to help specify and clarify the user's intention, mitigating potential biases in the generated image.
- **Image Generation**: Generates images from refined prompts using OpenAI's DALL-E model.
- **Iterative Refinement**: Allows users to iteratively refine their prompts based on specific questions, further reducing bias in the final image generation.


## Setup

### Backend Setup

1. Navigate to the `image-text-generator-backend` directory.
2. Install dependencies with `npm install`.
3. Create a `.env` file with your OpenAI API key:

OPENAI_API_KEY=your_api_key_here

4. Start the server with `npm start`. The server will run on `http://localhost:3001`.

### Frontend Setup

1. Navigate to the `image-text-generator` directory.
2. Install dependencies with `npm install`.
3. Start the React app with `npm start`. It will open `http://localhost:3000` in your browser.

## Usage

1. Enter an initial prompt related to the image you want to generate.
2. Answer the generated questions to refine your prompt and reduce potential bias.
3. Click "Generate" to create an image based on your refined prompt.
4. (Optional) Iterate on the generated image by refining further or generating variations.

## Contributing

Contributions are welcome! Please open an issue or submit a pull request with your proposed changes or improvements.

## License

[MIT License](LICENSE.md)
