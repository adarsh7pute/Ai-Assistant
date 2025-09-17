import axios from "axios";

const geminiResponse = async (command, assistantName = "Your Assistant", userName = "User", imageData = null) => {
  const lowerCommand = command?.toLowerCase().trim() || "";

  // Evaluate mathematical expressions
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

  const promptSuggestions = [ "Open calculator", "Show today's news", "Tell me a joke", "What time is it?",
    "Search for AI trends", "Open YouTube", "Show weather forecast", "Open Google Maps", "What's on my calendar?",
    "Set a reminder", "Play some music", "Find nearby restaurants", "Define artificial intelligence", "How to make pizza?"
  ];

  // Check for specific commands
  // if (lowerCommand.includes("hello") || lowerCommand.includes("hi") || lowerCommand.includes("hey")) {
  //   return `Hello ${userName}! I'm ${assistantName}. Try asking me things like: ${promptSuggestions.slice(0, 5).join(", ")}`;
  // } else if (lowerCommand.includes("what can you do") || lowerCommand.includes("help") || lowerCommand.includes("features")) {
  //   return "I can help with: " + promptSuggestions.join(", ");
  // } else if (lowerCommand.includes("how are you")) {
  //   return "I'm functioning optimally. How can I assist you today?";
  // } else if (lowerCommand.includes("who are you") || lowerCommand.includes("what do you do")) {
  //   return `I'm ${assistantName}, your AI assistant. I can perform various tasks like calculations, web searches, and more.`;
  // } else if (lowerCommand.includes("joke")) {
  //   return "Why don't scientists trust atoms? Because they make up everything!";} else 
  if (lowerCommand.startsWith("remind me to") || lowerCommand.startsWith("set a reminder")) {
    const reminderText = lowerCommand.replace(/(remind me to|set a reminder)/, "").trim();
    return `I'll remind you to: ${reminderText}`;
  } else if (lowerCommand.startsWith("play")) {
    const query = command.replace(/play\s*/i, "").trim();
    const searchQuery = query.length > 0 ? query : "music";
    return `Searching YouTube Music for "${searchQuery}"`;
  }

  // Check for math expressions
  const mathResponse = evaluateMath(command);
  if (mathResponse) {
    return mathResponse;
  }

  // Match map for various commands
  const matchMap = [
    {
      match: ["search youtube for","search YouTube","search youtube", "youtube search for", "youtube search", "find on youtube", "youtube video of","on youtube"],
      response: (cmd) => {
        const query = cmd.replace(/(search youtube for|search YouTube|search youtube|youtube search for|youtube search|find on youtube|youtube video of|search|on youtube)/i, "").trim();
        return `Searching YouTube "${query}". You can open it in a new tab.`;
      },
      action: (cmd) => {
        const query = cmd.replace(/(search youtube for|youtube search|find on youtube|youtube video of|on youtube)/i, "").trim();
        return `https://www.youtube.com/results?search_query=${encodeURIComponent(query)}`;
      }
    },
    {
      match: ["open calculator"],
      response: "Opening calculator... You can use it in a new tab.",
      action: () => "https://www.google.com/search?q=calculator"
    },
    {
      match: ["open insta","open instagram","open insta"],
      response: "Opening Instagram... You can use it in a new tab.",
      action: () => "https://www.instagram.com/"
    },
    {
      match: ["open facebook"],
      response: "Opening Facebook... You can use it in a new tab.",
      action: () => "https://www.facebook.com/"
    },
    {
      match: ["open email", "open gmail", "check mail"],
      response: "Opening Gmail... You can use it in a new tab.",
      action: () => "https://mail.google.com/"
    },
    {
      match: ["open calendar", "show calendar", "calendar"],
      response: "Opening Calendar... You can use it in a new tab.",
      action: () => "https://calendar.google.com/"
    },
    {
      match: ["open linkedin"],
      response: "Opening LinkedIn... You can use it in a new tab.",
      action: () => "https://www.linkedin.com/in/adarshsatpute/"
    },
    {
      match: ["what day", "today's day", "day today", "current day"],
      response: `Today is ${new Date().toLocaleDateString("en-US", { weekday: "long" })}.`,
    },
    {
      match: ["what time", "current time", "time now", "time"],
      response: `The time is ${new Date().toLocaleTimeString()}.`,
    },
    {
      match: ["what date", "today's date", "current date", "date today"],
      response: `Today's date is ${new Date().toLocaleDateString()}.`,
    },
    {
      match: ["open youtube"],
      response: "Opening YouTube... You can use it in a new tab.",
      action: () => "https://www.youtube.com/"
    },
    {
      match: ["news", "today's news", "current news", "headlines"],
      response: "Showing today's top news headlines... You can check it in a new tab.",
      action: () => "https://news.google.com/"
    },
    {
      match: ["weather", "weather today", "weather forecast"],
      response: "Showing weather information... You can check it in a new tab.",
      action: () => "https://www.google.com/search?q=weather"
    },
    {
      match: ["maps", "google maps", "location", "find location"],
      response: "Opening Google Maps... You can use it in a new tab.",
      action: () => "https://www.google.com/maps"
    },
    // {
    //   match: ["define", "what is", "who is"],
    //   response: (cmd) => `Searching for definition of ${cmd.replace(/(define|what is|who is)/gi, "").trim()}.`,
    //   action: (cmd) => `https://www.google.com/search?q=define+${encodeURIComponent(cmd.replace(/(define|what is|who is)/gi, "").trim())}`
    // }
  ];

  for (const item of matchMap) {
    const matchedKeyword = item.match.find(keyword => lowerCommand.includes(keyword));
    if (matchedKeyword) {
      const response = typeof item.response === 'function' ? item.response(command) : item.response;
      const actionUrl = typeof item.action === 'function' ? item.action(command) : item.action;
      
      // Here you can handle the opening of the URL in the calling context
      if (actionUrl) {
        window.open(actionUrl, "_blank"); // Open the URL in a new tab
      }
      
      return response; // Return the response message
    }
  }

  // If no command matched, proceed with the API call
  try {
    const res = await axios.post(import.meta.env.VITE_API_URL, {
      prompt: command,
      image: imageData
    });
    return res.data.reply;
  } catch (err) {
    console.error("Error occurred:", err);
    return "Error occurred.";
  }
};

export default geminiResponse;
