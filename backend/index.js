const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '.env') });

const app = require('./app');
const connectDB = require('./db');

const PORT = process.env.PORT || 1241;

connectDB()
  .then(() => {
    console.log('MongoDB connected.');
  })
  .catch((err) => {
    console.error('Initial MongoDB connection failed:', err.message);
  });

app.listen(PORT, () => {
  console.log(`Jonoshokti API running on http://localhost:${PORT}`);
});
