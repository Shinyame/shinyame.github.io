const express = require('express');
const app = express();

app.get('/redirect', (req, res) => {
    const originalUrl = req.query.url;
    res.redirect(originalUrl);
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
