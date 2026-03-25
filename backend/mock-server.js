const express = require('express');
const app = express();
const PORT = 8000;

app.get('/', (req, res) => res.send('Mock Server Running'));
app.listen(PORT, () => console.log('MOCK SERVER ON PORT ' + PORT));
