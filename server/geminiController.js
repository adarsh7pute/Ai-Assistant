import axios from "axios";

const geminiResponse = async (command, assistantName = "Your Assistant", userName = "User ") => {
  const evaluateMath = (text) => {
    const mathPattern = /^[\d+\-*/().\s]+$/;
    const cleanText = text.replace(/ /g, "");

    if (mathPattern.test(cleanText)) {
      try {
        const result = Function(`"use strict"; return (${cleanText})`)();
        return isFinite(result) ? `The answer is ${result}` : null;
      } catch {
        return null;
      }
    }
    return null;
  };

  const lowerCmd = command.toLowerCase().trim();
  const mathResponse = evaluateMath(command);
  if (mathResponse) {
    return { response: mathResponse };
  }

  if (["hello", "hi", "hey"].includes(lowerCmd)) {
    return { response: `Hello ${userName}! I'm ${assistantName}. Try asking me things like: What can you do?` };
  }

  if (lowerCmd.includes("search on youtube")) {
    const query = command.replace(/search on youtube/i, "").trim();
    if (query) {
      return { response: `Searching YouTube for "${query}"...`, url: `https://www.youtube.com/results?search_query=${encodeURIComponent(query)}` };
    } else {
      return { response: "Please specify what to search for on YouTube." };
    }
  } else if (lowerCmd.includes("search on google")) {
    const query = command.replace("search on google", "").trim();
    return { response: `Searching Google for "${query}"...`, url: `https://www.google.com/search?q=${encodeURIComponent(query)}` };
  } else if (lowerCmd.includes("open calculator")) {
    return { response: "Opening Calculator...", url: "https://www.calculator.com" };
  } else if (lowerCmd.includes("open maps")) {
    return { response: "Opening Maps...", url: "https://www.google.com/maps" };
  }

  // Additional functionalities
  if (lowerCmd.includes("joke")) {
    return { response: "Why don't scientists trust atoms? Because they make up everything!" };
  }

  if (lowerCmd.startsWith("remind me to") || lowerCmd.startsWith("set a reminder")) {
    const reminderText = lowerCmd.replace(/(remind me to|set a reminder)/, "").trim();
    return { response: `I'll remind you to: ${reminderText}` };
  }

  if (lowerCmd.startsWith("play")) {
    const query = command.replace(/play\s*/i, "").trim();
    const searchQuery = query.length > 0 ? query : "music";
    return { response: `Searching YouTube Music for "${searchQuery}"`, url: `https://music.youtube.com/search?q=${encodeURIComponent(searchQuery)}` };
  }

  // Handle other commands
  const matchMap = [
    {
      match: ["open instagram"],
      response: "Opening Instagram...",
      url: "https://www.instagram.com/"
    },
    {
      match: ["open facebook"],
      response: "Opening Facebook...",
      url: "https://www.facebook.com/"
    },
    {
      match: ["open email", "open gmail"],
      response: "Opening Gmail...",
      url: "https://mail.google.com/"
    },
    {
      match: ["open calendar"],
      response: "Opening Calendar...",
      url: "https://calendar.google.com/"
    },
    {
      match: ["what day"],
      response: `Today is ${new Date().toLocaleDateString("en-US", { weekday: "long" })}`
    },
    {
      match: ["what time"],
      response: `The time is ${new Date().toLocaleTimeString()}`
    },
    {
      match: ["what date"],
      response: `Today's date is ${new Date().toLocaleDateString()}`
    },
    {
      match: ["news"],
      response: "Showing today's top news headlines...",
      url: "https://news.google.com/"
    },
    {
      match: ["weather"],
      response: "Showing weather information...",
      url: "https://www.google.com/search?q=weather"
    },
    {
      match: ["maps"],
      response: "Opening Google Maps...",
      url: "https://www.google.com/maps"
    },
    {
      match: ["define"],
      response: (cmd) => `Searching for definition of ${cmd.replace(/(define)/gi, "").trim()}`,
      url: (cmd) => `https://www.google.com/search?q=define+${encodeURIComponent(cmd.replace(/(define)/gi, "").trim())}`
    }
  ];

  for (const item of matchMap) {
    const matchedKeyword = item.match.find(keyword => lowerCmd.includes(keyword));
    if (matchedKeyword) {
      return { response: typeof item.response === 'function' ? item.response(command) : item.response, url: item.url || null };
    }
  }

  // If no command matched, proceed with the API call
  try {
    const res = await axios.post('http://localhost:5000/api/ask', { prompt: command });
    return { response: res.data.reply };
  } catch (err) {
    return { response: "Error occurred." };
  }
};

export default geminiResponse;
