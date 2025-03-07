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
async function CreateContent(req, res) {
    const {length,keyword,title,style,note,outline} = req.body;
    try {
        const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash',tools: [{ 'google_search':{} }] });
        const Prompt = `Trong vai một nhà sáng tao nội dung. Hãy viết một bài blog thỏa các tiêu chí bên dưới:
            1. Độ dài bài viết: ${length}
            2. Từ khóa mục tiêu: ${keyword}
            3. Tiêu đề bài viết: ${title}
            4. Phong cách viết: ${style}
            5. Dàn ý bàn viết theo cấu trúc mardown sau đây:
            ${outline} \n\n
            6. In đậm từ khóa mục tiêu trong nội dung
            ${note}
            *Lưu ý: chỉ trả về nội dung bài blog, không cần thêm câu chào hay hướng dẫn.
            \`\`\`
        `
        const response = await model.generateContent(Prompt);
        const data = {
            content: response.response.text(),
            promptTokenCount: response.response.usageMetadata.promptTokenCount,
            candidatesTokenCount: response.response.usageMetadata.candidatesTokenCount,
            totalTokenCount: response.response.usageMetadata.totalTokenCount
        };
        res.json(data);
    }catch (error) {
        console.error("Error generating response: ", error); 
        res.status(500).send("An error occurred while generating the response");
    }
}
async function CreateOutline(req, res) {
    const {length,keyword,title} = req.body;
    try {
        const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash',tools: [{ 'google_search':{} }] });
        const Prompt = `Trong vai một nhà sáng tao nội dung. Hãy cho tôi dàn ý để viết một bài blog thỏa các tiêu chí bên dưới:
            1. Độ dài bài viết: ${length}
            2. Từ khóa mục tiêu: ${keyword}
            3. Tiêu đề bài viết: ${title}
            4. Dàn ý chỉ cần trả về thẻ H2 và H3, không cần nội dung chi tiết, không dùng từ kế luận, tóm lại, tổng kết... trong dàn ý.
            5. Dàn ý trả về dạng markdown theo cấu trúc JSON bên dưới.
            \`\`\`json
            [
                {
                    "tieude": "<Tiêu đề H2>",
                    "child": [
                        "<Tiêu đề H3>",
                        "<Tiêu đề H3>"
                    ]
                },
                ...
            ]
            ** Chỉ trả về markdown json, ko cần thêm câu chào khác
            \`\`\`
        `;
        const response = await model.generateContent(Prompt);
        const data = {
            content: response.response.text(),
            promptTokenCount: response.response.usageMetadata.promptTokenCount,
            candidatesTokenCount: response.response.usageMetadata.candidatesTokenCount,
            totalTokenCount: response.response.usageMetadata.totalTokenCount
        };
        res.json(data);
    }catch (error) {
        console.error("Error generating response: ", error); 
        res.status(500).send("An error occurred while generating the response");
    }
}
module.exports = { CreateContent,CreateOutline };
