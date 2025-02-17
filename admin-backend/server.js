const express = require('express');
const mysql = require('mysql2');
require('dotenv').config(); // Load environment variables
const cors = require('cors'); // Import the CORS package

const userRoutes = require('./routes/route'); // Import routes

const app = express();
const host = process.env.SERVER_HOST || 'localhost'; // Replace with your desired IP
const port = process.env.SERVER_PORT || 4000;
// Enable CORS for all origins
app.use(cors()); // This will allow all domains to make requests to your server

// Or enable CORS for specific origin (example for React app running on port 3000)
app.use(cors({
    origin: `http://${host}:4201` // Allow only React app to access the API
}));
// Middleware
app.use(express.json()); // For parsing JSON bodies

// Database connection function
async function connectToDatabase() {
    return new Promise((resolve, reject) => {
        const connection = mysql.createConnection({
            host: process.env.DB_HOST,
            user: process.env.DB_USER,
            password: process.env.DB_PASSWORD,
            database: process.env.DB_NAME,
            port: process.env.DB_PORT || 3306, // Default to 3306 if not specified
        });

        connection.connect((err) => {
            if (err) {
                reject(err);
            } else {
                console.log('Connected to the MySQL database as ID', connection.threadId);
                resolve(connection);
            }
        });
    });
}

// Start the server
async function startServer() {
    try {
        // Connect to the database
        // await connectToDatabase();

        // Define routes
        app.get('/', (req, res) => {
            res.send('API Running');
        });

        app.use('/api', userRoutes); // Use the routes with a base path

        // Start listening on a specific IP address
        app.listen(port, host, () => {
            console.log(`Server is running on http://${host}:${port}`);
        });
    } catch (error) {
        console.error('Failed to start the server:', error.message);
        process.exit(1); // Exit the process with an error code
    }
}

startServer();

