const { StreamChat } = require('stream-chat');

// Initialize the client using your API key and secret.
const chatClient = new StreamChat('YOUR_API_KEY', 'YOUR_API_SECRET');

module.exports = chatClient;
