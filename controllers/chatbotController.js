const express = require('express');
const fs = require('fs');
const multer = require("multer");
const {
    GoogleGenerativeAI,
    HarmCategory,
    HarmBlockThreshold,
  } = require("@google/generative-ai");
const apiKey = "AIzaSyB4kLITJTufjRUTjqt2OsxZnwDLdkY31Pg";
const genAI = new GoogleGenerativeAI(apiKey);
async function chatWithBot(req, res) {
    const {messages} = req.body;
    try {
        const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash',tools: [{ 'google_search':{} }] });
        if (!Array.isArray(messages) || messages.length === 0) {
            return res.status(400).json({ error: 'Messages are required' });
        }
        const defaultPrompt = `Bạn là một chú Bò thông minh ở Việt Nam, hãy giúp mọi người giải quyết vấn đề nhé!
                            * Bạn luôn trả lời các câu hỏi theo múi giờ Việt Nam.
                            * Khi không trả lời được câu hỏi, bạn hãy nói "Mình không hiểu câu hỏi này".`;
        const history = messages.map((msg, index) => ({
            role: msg.role,
            parts: [{ text: index === 0 ? `${defaultPrompt}\n\n${msg.content}` : msg.content }]
        }));
        const chat = model.startChat({
            history: history,
            responseMimeType: "text/plain",
        });
        const messagesString = messages.map((msg, index) => index === 0 ? `${defaultPrompt}\n\n${msg.content}`: msg.content).join('\n\n');
        const response = await chat.sendMessage(messagesString);
        
        // console.log(response.response.text());
        res.send(response.response.text());
    }catch (error) {
        console.error("Error generating response: ", error); 
        res.status(500).send("An error occurred while generating the response");
    }
    // if (!Array.isArray(messages) || messages.length === 0) {
    //     return res.status(400).json({ error: 'Messages are required' });
    // }
    // const defaultPrompt = `Bạn là một chú Bò thông minh ở, hãy giúp mọi người giải quyết vấn đề nhé!
    //                         * Bạn luôn trả lời các câu hỏi theo múi giờ Việt Nam.
    //                         * Khi không trả lời được câu hỏi, bạn hãy nói "Mình không hiểu câu hỏi này".
    // `;
    // const history = messages.map((msg, index) => ({
    //     role: msg.role,
    //     parts: [{ text: index === 0 ? `${defaultPrompt}\n\n${msg.content}` : msg.content }]
    // }));
    // const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash',tools: [{ 'google_search':{} }] });
    // const chat = model.startChat({
    //     history: history,
    //     responseMimeType: "text/plain",
    // });
    // const messagesString = messages
    //   .map((msg, index) => index === 0 
    //     ? `${defaultPrompt}\n\n${msg.content}` 
    //     : msg.content
    //   )
    //   .join('\n\n')
    // const stream = await chat.sendMessageStream(messagesString);
    // res.setHeader('Content-Type', 'text/event-stream');
    // res.setHeader('Cache-Control', 'no-cache');
    // res.setHeader('Connection', 'keep-alive');

    // let buffer = "";

    // for await (const chunk of stream.stream) {
    //     let chunkText = buffer + chunk.text();
    //     buffer = "";
    //     let boldRegex = /\*\*([^*]+?)\*\*/g;
    //     let match;

    //     while ((match = boldRegex.exec(chunkText)) !== null) {
    //         chunkText = chunkText.replace(match[0], `<strong>${match[1]}</strong>`);
    //     }
    //     if (chunkText.lastIndexOf("**") > -1) {
    //         let lastBoldIndex = chunkText.lastIndexOf("**");
    //         buffer = chunkText.substring(lastBoldIndex);
    //         chunkText = chunkText.substring(0, lastBoldIndex); 
    //     }
    //     res.write(`${chunkText}\n\n`);
    // }
    // if (buffer.length > 0) {
    //     res.write(buffer); 
    // }
    // res.end();
}

module.exports = { chatWithBot };
