import React, { useState } from "react";
import "./App.css";

const App = () => {
  const [error, setError] = useState(null);
  const [value, setValue] = useState("");
  const [loading, setLoading] = useState(false);

  const Timeout = 120;
  const [chatHistory, setChatHistory] = useState([]);

  let data;

  const clear = () => {
    setError(null);
    setValue("");
  };

  const selectRandomOPtions = [
    "What's your coaching philosophy?",
    "What's your favorite play to run in a game?",
    "How do you motivate players to improve?",
    "What are some key drills you use in practice?",
    "What are your thoughts on the current state of basketball?",
    "Who are some of your favorite basketball players of all time?",
    "What advice would you give to young players who want to succeed in basketball?",
    "What's your take on the importance of teamwork in basketball?",
    "How do you handle difficult situations with players?",
    "What's the most important lesson you've learned as a coach?",
  ];

  const selectRandomly = () => {
    const randomValue =
      selectRandomOPtions[
        Math.floor(Math.random() * selectRandomOPtions.length)
      ];
    setValue(randomValue);
  };

  const fetchData = async () => {
    const options = {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        history: chatHistory,
        message: value,
      }),
    };

    const response = await fetch(
      "http://localhost:5000/gemini/send-response",
      options
    );
    const result = await response.text();
    return result;
  };

  const fetchDataAndHandleTimeout = async () => {
    try {
      const result = await Promise.race([
        fetchData(),
        new Promise((resolve) => setTimeout(resolve, Timeout * 1000)),
      ]);
      return result;
    } catch (error) {
      setError("Timeout, please check your internet connection");
      setLoading(false);
    }
  };

  const getResponse = async () => {
    if (!value) {
      setError("Error: please enter a value");
      return;
    }

    try {
      setLoading(true);
      data = await fetchDataAndHandleTimeout();

      const formattedRes = data
        .split("\\n")
        .map((part, index) => <p key={index}>{part}</p>);

      setChatHistory((oldChatHsitory) => [
        ...oldChatHsitory,
        {
          role: "user",
          parts: value,
        },
        {
          role: "Carter",
          parts: formattedRes,
        },
      ]);

      setValue("");
      setLoading(false);
    } catch (error) {
      setLoading(false);
      setError("something went wrong");
    }
  };

  const listenEnter = (e) => {
    if (e.key === "Enter") {
      getResponse();
    }
  };

  const userMessages = chatHistory.filter((item) => item.role === "user");
  const CarterMessages = chatHistory.filter((item) => item.role === "Carter");

  const minLength = Math.min(userMessages.length, CarterMessages.length);

  const interleavedMessages = [];

  for (let i = minLength - 1; i >= 0; i--) {
    interleavedMessages.push(userMessages[i], CarterMessages[i]);
  }

  if (userMessages.length > minLength) {
    interleavedMessages.push(
      ...userMessages.slice(0, userMessages.length - minLength).reverse()
    );
  }
  if (CarterMessages.length > minLength) {
    interleavedMessages.push(
      ...CarterMessages.slice(0, CarterMessages.length - minLength).reverse()
    );
  }

  return (
    <div className="wrapper">
      <h1 className="app-title">COACH CARTER </h1>
      <section className="app">
        <p>
          What do you want to know?
          <button
            className="suprise-me"
            onClick={selectRandomly}
            disabled={!chatHistory || loading}
          >
            Get Basketball advice👍
          </button>
        </p>

        <div className="search-container">
          <input
            value={value}
            placeholder="Need some Basketball advice?"
            onKeyDown={listenEnter}
            onChange={(e) => setValue(e.target.value)}
          ></input>
          {!error && (
            <button className="search-button" onClick={getResponse}>
              Search
            </button>
          )}
          {error && (
            <button className="search-button" onClick={clear}>
              Clear
            </button>
          )}
        </div>
        {error && <p className="error">{error}</p>}

        <div className="search-result">
          {loading && (
            <div className="Answer">
              <div className="spinner"></div>
            </div>
          )}

          {interleavedMessages.map((chatItem, index) => (
            <div className="Answer" key={index}>
              <p>
                {chatItem.role}:{" "}
                {Array.isArray(chatItem.parts)
                  ? chatItem.parts.map((part, idx) => (
                      <span key={idx}>
                        {typeof part === "object" ? part : part.toString()}
                      </span>
                    ))
                  : chatItem.parts}
              </p>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
};

export default App;
