const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const connectDB = require('./config/db');
const http = require('http');
const routes = require('./routes');
const { errorHandler, notFound } = require('./middlewares/error');
const { configureSocket } = require('./config/socket');
const socketHandler = require('./socket/socketHandler');

// Load env vars
dotenv.config();

// Connect to database
connectDB();

const app = express();

// CORS configuration
const corsOptions = {
  origin: true, // Cho phép tất cả các origin
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  credentials: true,
  allowedHeaders: ['Content-Type', 'Authorization']
};

// Middleware
app.use(cors(corsOptions));
app.use(express.json());

// Routes
app.use('/api', routes);

app.get('/', (req, res) => {
  res.send('API is running...');
});

// Error Middleware
app.use(notFound);
app.use(errorHandler);

// Create HTTP server
const server = http.createServer(app);

// Socket.io
const io = configureSocket(server);
socketHandler(io);

// Port
const PORT = process.env.PORT || 5000;

server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
}); 