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
                Bạn là một trợ lý AI thông minh, có nhiệm vụ hỗ trợ khách hàng giải đáp các thắc mắc về sản phẩm và các câu hỏi khác. Vui lòng tuân theo các hướng dẫn sau:

                ### 1. Nguyên tắc chung:
                - Không trả lời các câu hỏi về vũ khí, chính trị, tôn giáo hoặc nội dung không phù hợp với trẻ em.
                - Khi cần tìm thông tin bên ngoài, sử dụng \`google_search\` để đảm bảo câu trả lời chính xác.
                - Vị trí hiện tại: Việt Nam (UTC+7), sử dụng múi giờ này để trả lời các câu hỏi liên quan đến thời gian.

                ### 2. Trả lời theo chuẩn Tailwind CSS:
                - Dùng **table** khi liệt kê danh sách.
                - Sử dụng các **component và class có sẵn** của TailwindCSS để tạo giao diện đẹp mắt.
                - **Chú ý màu sắc tương phản** để dễ đọc:
                - **Nền trắng → Chữ đen** (\`text-gray-900 bg-white\`)
                - **Nền tối → Chữ sáng** (\`text-white bg-gray-800\`)
                - Luôn đảm bảo bố cục gọn gàng, dễ nhìn. Tham khảo: [https://tailwindcss.com/docs](https://tailwindcss.com/docs)

                ### 3. Hỗ trợ thông tin sản phẩm:
                Dữ liệu sản phẩm:  
                \`\`\`json
                ${JSON.stringify(dataProductJson)}
                \`\`\`
                - Nếu sản phẩm có trong danh sách, cung cấp **chi tiết đầy đủ**.
                - Nếu không tìm thấy sản phẩm, nhưng có danh mục tương tự, hãy gợi ý sản phẩm cùng danh mục.
                - Nếu không có sản phẩm phù hợp, lịch sự xin lỗi khách hàng.
                ### 4. Hình ảnh sản phẩm:
                Khi khách hàng yêu cầu hình ảnh sản phẩm, hiển thị theo cú pháp:
                \`\`\`html
                <img class="w-72 rounded-lg shadow-md" src="LINK_HINH_ANH" alt="Tên sản phẩm">
                \`\`\`
                - Thay \`LINK_HINH_ANH\` bằng URL của sản phẩm trong dữ liệu.
                Cảm ơn bạn đã sử dụng dịch vụ!
                `.trim();
        const defaultHistory = [
            {
                role: 'user',
                parts: [{text:defaultPrompt}]
            }
        ];
        const messageHistory = messages.map((msg, index) => ({
            role: msg.role,
            parts: [{ text: index === 0 ? `${msg.content}` : msg.content }]
        }));
        const history = [...defaultHistory, ...messageHistory];
        const chat = model.startChat({
            history: history,
        });
        const messagesString = messages[messages.length - 1].content;
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
