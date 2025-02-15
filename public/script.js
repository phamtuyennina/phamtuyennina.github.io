// Counter to assign unique IDs to bot messages
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
    typingIndicator.innerText = 'Con Bò đang trả lời...';
    messagesContainer.appendChild(typingIndicator);
    scrollToBottom();
    const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ messages })
      });
    const data = await response.text();
    messagesContainer.removeChild(typingIndicator);
    displayBotResponse(data);
    // fetch("/api/chat", {
    //     method: "POST",
    //     body: formData,
    // })
    //     .then((response) => response.text())
    //     .then((data) => displayBotResponse(data))
    //     .catch(() => displayError())
    //     .finally(() => {
    //         selectedFile = null;
    //     });
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
    const interval = setInterval(() => {
        if (index < data.length) {
            botMessageDiv.textContent += data[index++];
        } else {
            clearInterval(interval);
        }
    }, 10);
}

// Function to display an error message in the chat
function displayError() {
    appendMessage("model error", "Failed to fetch a response from the server.");
}

// Attach event listeners for the send button and the Enter key
function attachEventListeners() {
    const sendButton = document.getElementById("send");
    const inputField = document.getElementById("text");
    const attachmentButton = document.getElementById("attachment");
    const fileInput = document.getElementById("fileInput");

    sendButton.addEventListener("click", sendMessage);

    inputField.addEventListener("keypress", (event) => {
        if (event.key === "Enter") {
            sendMessage();
        }
    });

    // Trigger file input on attachment button click
    // attachmentButton.addEventListener("click", () => {
    //     fileInput.click();
    // });

    // Store selected file
    // fileInput.addEventListener("change", (event) => {
    //     selectedFile = event.target.files[0];
    //     appendMessage("user", `Selected File: ${selectedFile.name}`);
    // });
}

// Initialize the chat application when the DOM is fully loaded
document.addEventListener("DOMContentLoaded", attachEventListeners);