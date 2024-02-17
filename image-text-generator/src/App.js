import React, { useState, useEffect, useCallback } from 'react';
import './App.css';

function App() {
  const [prompt, setPrompt] = useState('');
  const [questions, setQuestions] = useState([]);
  const [answers, setAnswers] = useState({});
  const [imageUrl, setImageUrl] = useState('');

  // Fetch questions based on the current prompt
  const fetchQuestions = useCallback(async () => {
    try {
      const response = await fetch('http://localhost:3001/generate-questions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt }),
      });
      if (!response.ok) throw new Error('Failed to fetch questions');
      const data = await response.json();
      setQuestions(data.questions || []);
      setAnswers(data.questions.reduce((acc, _, index) => ({ ...acc, [index]: '' }), {}));
    } catch (error) {
      console.error("Failed to fetch questions:", error);
    }
  }, [prompt]);

  // Debounce effect for fetching questions
  useEffect(() => {
    const handler = setTimeout(() => {
      if (prompt) fetchQuestions();
    }, 500); // Delay fetching until typing stops for 500ms
    return () => clearTimeout(handler);
  }, [prompt, fetchQuestions]);

  const handlePromptChange = (e) => setPrompt(e.target.value);

  const handleAnswerChange = (index, value) => {
    setAnswers((prevAnswers) => ({
      ...prevAnswers,
      [index]: value,
    }));
  };

  const handleRefinePrompt = async (questionIndex) => {
    // Collect the single question and its answer to refine the prompt
    const questionAnswers = [{ question: questions[questionIndex], answer: answers[questionIndex] }];
    try {
      const response = await fetch('http://localhost:3001/refine-prompt', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ originalPrompt: prompt, questionsAnswers: questionAnswers }),
      });
      if (!response.ok) throw new Error('Failed to refine prompt');
      const data = await response.json();
      // Update the main prompt with the refined version
      setPrompt(data.refinedPrompt);
    } catch (error) {
      console.error("Failed to refine prompt:", error);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Directly use the current state's prompt to generate the image
    try {
      const response = await fetch('http://localhost:3001/generate-image', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt }),
      });
      if (!response.ok) {
        throw new Error("Failed to generate image");
      }
      const data = await response.json();
      setImageUrl(data.imageUrl);
    } catch (error) {
      console.error(error);
    }
  };

  const handleGenerateImageVariations = async () => {
    try {
      const response = await fetch('http://localhost:3001/generate-image-variations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        // Assuming using imageUrl as a reference; adjust as needed based on actual data structure
        body: JSON.stringify({ imageId: imageUrl }), 
      });
      if (!response.ok) {
        throw new Error("Failed to generate image variations");
      }
      const data = await response.json();
      // Update the imageUrl with one of the variations; this can be adjusted based on UI
      setImageUrl(data.imageUrls[0]);
    } catch (error) {
      console.error(error);
    }
  };
  
{imageUrl && (
  <div className="image-section">
    <img src={imageUrl} alt="Generated" />
    <button onClick={handleGenerateImageVariations}>Generate Variations</button>
  </div>
)}
  

  return (
    <div className="App">
      <header className="App-header">
        <form class="main-input-container" onSubmit={handleSubmit}>
          <label class="main-prompt-input ">
            Enter your image generation prompt: <br></br>
            <textarea type="text" class="main-prompt-text-input" value={prompt} onChange={handlePromptChange} />
          </label>
          {questions.map((question, index) => (
            <div key={index} className="question-answer-section">
              <label>
                {question}<br></br>
                <input
                  type="text"
                  value={answers[index] || ''}
                  onChange={(e) => handleAnswerChange(index, e.target.value)}
                />
                <button type="button" onClick={() => handleRefinePrompt(index)}>Refine Prompt</button>
              </label>
            </div>
          ))}
          <button type="submit">Generate</button>
        </form>
        {imageUrl && <img src={imageUrl} alt="Generated" />}
      </header>
    </div>
  );
}


export default App;
