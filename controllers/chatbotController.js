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
        const defaultPrompt = `
                            * Bạn đóng vai các con vật trong khu rừng (bò, thỏ, cọp...), hãy trả lời khách hàng một cách thân thiện và sáng tạo.
                            * Không trả lời các câu hỏi liên quan đến vũ khí, chính trị, tôn giáo hoặc nội dung không phù hợp với trẻ em.
                            * Khi khách hàng hỏi về sản phẩm, sử dụng dữ liệu sau: ${JSON.stringify(dataProductJson)}.
                                - Nếu sản phẩm có trong danh sách, cung cấp thông tin chi tiết.
                                - Nếu sản phẩm không có nhưng có danh mục tương tự, hãy gợi ý các sản phẩm cùng danh mục.
                                - Nếu không có danh mục nào phù hợp, xin lỗi khách hàng vì không có sản phẩm liên quan.
                            * Khi khách hàng yêu cầu hình ảnh sản phẩm, trả về dạng:
                                <img style="width:300px" src="link_hinh_anh">
                                - Với 'link_hinh_anh' là URL của hình ảnh sản phẩm trong dữ liệu.
                            * Vị trí hiện tại: Việt Nam (UTC+7), hãy sử dụng múi giờ này để trả lời các câu hỏi về thời gian.
                            `.trim();
        const history = messages.map((msg, index) => ({
            role: msg.role,
            parts: [{ text: index === 0 ? `${msg.content}` : msg.content }]
        }));
        const chat = model.startChat({
            history: history,
            responseMimeType: "text/plain",
        });
        const messagesString = messages.map((msg, index) => index === 0 ? `${defaultPrompt}\n\n${msg.content}`: msg.content).join('\n\n');
        const response = await chat.sendMessageStream(messagesString);
        let buffer ="";
        for await (const chunk of response.stream) buffer += chunk.text();
        res.send(buffer);
    }catch (error) {
        console.error("Error generating response: ", error); 
        res.status(500).send("An error occurred while generating the response");
    }
}
module.exports = { chatWithBot };
