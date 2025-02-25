let messageCount = 0;
let selectedFile = null; 
var messages = [];
const messagesContainer = document.getElementById('chatContainer');
function scrollToBottom() {
    const chatContainer = document.getElementById("chatContainer");
    chatContainer.scrollTop = chatContainer.scrollHeight;
}
function appendMessage(sender, message, id = null) {
    const messageHtml = `
      <div class="message ${sender}">
        <div class="msg-header">${capitalizeFirstLetter(sender)}</div>
        <div class="msg-body" ${id ? `id="${id}"` : ""}>${message}</div>
      </div>
    `;
    if(sender === "user") {
        messages.push({
            role: sender,
            content: message
        });
    }
    document.getElementById("chatContainer").insertAdjacentHTML('beforeend', messageHtml);
    scrollToBottom();
}
function capitalizeFirstLetter(string) {
    return string.charAt(0).toUpperCase() + string.slice(1);
}
function sendMessage() {
    const inputField = document.getElementById("text");
    const rawText = inputField.value;
    appendMessage("user", rawText); 
    fetchBotResponse(messages); 
    inputField.value = "";
}
async function fetchBotResponse(messages) {
    const typingIndicator = document.createElement('div');
    typingIndicator.classList.add('typing');
    typingIndicator.innerText = 'Chatbot đang trả lời...';
    messagesContainer.appendChild(typingIndicator);
    scrollToBottom();
    const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ messages })
      }).then((response) => response.text()).then((data) => displayBotResponse(data)).catch(() => displayError());
    messagesContainer.removeChild(typingIndicator);
}
function displayBotResponse(data) {
    const botMessageId = `botMessage-${messageCount++}`;
    messages.push({
        role: 'model',
        content: data
    });

    appendMessage("model", "", botMessageId);
    const botMessageDiv = document.getElementById(botMessageId);
    botMessageDiv.textContent = "";

    let index = 0;
    let displayedText = ""; 
    let htmlBlocks = [];
    let cleanedData = data.replace(/```html([\s\S]*?)```/g, (_, content) => content.trim());
    cleanedData = cleanedData.replace(/(<(table|img|div|ul|ol|li|h[1-6])[\s\S]*?>[\s\S]*?<\/\2>)/gi, (match) => {
        htmlBlocks.push(match);
        return `{{HTML_BLOCK_${htmlBlocks.length - 1}}}`;
    });
    hljs.addPlugin(new CopyButtonPlugin({
        autohide: false,
      }));
    const textContent = cleanedData;
    const interval = setInterval(() => {
        if (index < textContent.length) {
            displayedText += textContent[index++];
            botMessageDiv.innerHTML = marked.parse(displayedText);
            hljs.highlightAll();
            htmlBlocks.forEach((block, i) => {
                botMessageDiv.innerHTML = botMessageDiv.innerHTML.replace(`{{HTML_BLOCK_${i}}}`, block);
            });
            scrollToBottom();
        } else {
            clearInterval(interval);
            botMessageDiv.innerHTML = marked.parse(cleanedData);
            htmlBlocks.forEach((block, i) => {
                botMessageDiv.innerHTML = botMessageDiv.innerHTML.replace(`{{HTML_BLOCK_${i}}}`, block);
            });
            hljs.highlightAll();
            scrollToBottom();
        }
    }, 10);
   
}
function displayError() {
    appendMessage("model error", "Failed to fetch a response from the server.");
}
function attachEventListeners() {
    const sendButton = document.getElementById("send");
    const inputField = document.getElementById("text");
    const attachmentButton = document.getElementById("attachment");
    const fileInput = document.getElementById("fileInput");

    sendButton.addEventListener("click", sendMessage);

    inputField.addEventListener("keypress", (event) => {
        if (event.key === "Enter") {
            event.preventDefault();
            sendMessage();
            return false;
        }
    });
}
document.addEventListener("DOMContentLoaded", attachEventListeners);