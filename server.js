const express = require('express');
const cors = require('cors')
const router = require('./routes/index');
const path = require('path');


const app = express();


const PORT = 9000;

app.use(cors({
    origin: '*',
    methods: ['POST']
}))
  
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'public')));
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use('/api', router);
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});
app.get('/chatbot', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'chatbot.html'));
});
app.listen(PORT, () => {
    console.log(`Server chạy tại http://localhost:${PORT}`);
});
