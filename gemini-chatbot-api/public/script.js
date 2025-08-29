const form = document.getElementById('chat-form');
const input = document.getElementById('user-input');
const chatBox = document.getElementById('chat-box');
const sendButton = form.querySelector('button');

// The URL for the backend API endpoint
const API_URL = 'http://localhost:3002/api/chat';

// Store chat history to maintain conversation context
let chatHistory = [];

/**
 * Appends a new message to the chat box.
 * @param {string} sender - The sender of the message ('user' or 'bot').
 * @param {string} text - The content of the message.
 * @returns {HTMLElement} The created message element.
 */
function appendMessage(sender, text) {
  const msg = document.createElement('div');
  msg.classList.add('message', sender);
  msg.textContent = text;
  chatBox.appendChild(msg);
  chatBox.scrollTop = chatBox.scrollHeight;
  return msg;
}

form.addEventListener('submit', async function (e) {
  e.preventDefault();

  const userMessage = input.value.trim();
  if (!userMessage) return;

  appendMessage('user', userMessage);
  input.value = '';

  // Add user message to history
  chatHistory.push({ role: 'user', content: userMessage });

  // Disable form controls while waiting for response
  input.disabled = true;
  sendButton.disabled = true;

  const thinkingMsg = appendMessage('bot', 'Gemini is thinking...');

  try {
    const response = await fetch(API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        // Send the entire chat history for context
        message: chatHistory,
      }),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ error: 'Failed to get response from server.' }));
      throw new Error(errorData.error || 'An unknown error occurred.');
    }

    const data = await response.json();

    if (data && data.result) {
      thinkingMsg.textContent = data.result;
      // Add AI response to history. The Gemini API uses 'model' for its role.
      chatHistory.push({ role: 'model', content: data.result });
    } else {
      thinkingMsg.textContent = 'Sorry, no response received.';
      // If the bot failed, remove the last user message from history
      chatHistory.pop();
    }
  } catch (error) {
    console.error('Chat Error:', error);
    thinkingMsg.textContent = error.message || 'Failed to get response from server.';
    // If an error occurred, remove the last user message from history
    chatHistory.pop();
  } finally {
    // Re-enable form controls and focus input
    input.disabled = false;
    sendButton.disabled = false;
    input.focus();
    
    // Scroll to the bottom again in case the new message is long
    chatBox.scrollTop = chatBox.scrollHeight;
  }
});
