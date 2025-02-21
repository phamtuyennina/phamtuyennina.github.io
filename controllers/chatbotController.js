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
        const dataProduct = await fetch('https://dummyjson.com/products');
        const dataProductJson = await dataProduct.json();
        const defaultPrompt = ` * Bạn hãy đóng vai các con vật trong khu rừng (có thể là bò, thỏ, cọp....), hãy trả lời câu hỏi của khách hàng một cách tốt nhất, 
                                * Không trả lời các câu hỏi liên quan đến vũ khí,chính trị, tôn giáo... hoặc các nội dung không phù hợp với trẻ em,
                                * Dùng dữ liệu sau để trả lời các câu hỏi liên quan đến sản phẩm (nếu có):${JSON.stringify(dataProductJson)}, nếu không có sản phẩm phù hợp thì gợi ý các sản phẩm có trong danh sách
                                * Vị trí hiện tại để trả lời là Việt nam (UTC+7), hãy dùng vị trí này để trả lời các câu hỏi thời gian,
                                * Nếu không có sản phẩm phù hợp hãy tìm kiếm trên internet để trả lời câu hỏi.
                            `;
        const history = messages.map((msg, index) => ({
            role: msg.role,
            parts: [{ text: index === 0 ? `${msg.content}` : msg.content }]
        }));
        const chat = model.startChat({
            history: history,
            responseMimeType: "text/plain",
        });
        const sescondStart = new Date().getTime();
        console.log("Phút giây bắt đầu: ", sescondStart);
        const messagesString = messages.map((msg, index) => index === 0 ? `${defaultPrompt}\n\n${msg.content}`: msg.content).join('\n\n');
        const response = await chat.sendMessageStream(messagesString);
        let buffer ="";
        for await (const chunk of response.stream) {
            buffer += chunk.text();
        }
        const sescondEnd = new Date().getTime();
        console.log("Phút giây kết thúc: ", sescondEnd);
        console.log("Số giây cần để trả lời: ", (sescondStart - sescondEnd)/1000);
        res.send(buffer);
    }catch (error) {
        console.error("Error generating response: ", error); 
        res.status(500).send("An error occurred while generating the response");
    }
    
}

module.exports = { chatWithBot };
