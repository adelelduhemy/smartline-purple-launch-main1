const express = require('express');
const mysql = require('mysql2/promise');
const bcrypt = require('bcrypt');
const cors = require('cors');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const app = express();

// Create public directory for storing files
const publicDir = path.join(__dirname, 'public');
if (!fs.existsSync(publicDir)) {
  fs.mkdirSync(publicDir);
}

// Create drivers directory inside public
const driversDir = path.join(publicDir, 'drivers');
if (!fs.existsSync(driversDir)) {
  fs.mkdirSync(driversDir);
}

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    // Create a unique folder for each driver using timestamp
    const driverFolder = path.join(driversDir, Date.now().toString());
    if (!fs.existsSync(driverFolder)) {
      fs.mkdirSync(driverFolder);
    }
    cb(null, driverFolder);
  },
  filename: function (req, file, cb) {
    // Keep original filename but add timestamp to prevent conflicts
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const extension = path.extname(file.originalname);
    cb(null, file.fieldname + '-' + uniqueSuffix + extension);
  }
});

const upload = multer({ storage: storage });

const corsOptions = {
  origin: ['http://localhost:8080', 'http://localhost:8081'],
  optionsSuccessStatus: 200
};
app.use(cors(corsOptions));

app.use(express.json());
app.use('/public', express.static(publicDir));

const pool = mysql.createPool({
  host: 'localhost',
  user: 'root',
  password: '',
  database: 'smartline',
  port: 3306
});

// Initialize database tables
async function initializeDatabase() {
  try {
    // Create Drivers table if it doesn't exist
    await pool.query(`
      CREATE TABLE IF NOT EXISTS Drivers (
        id INT PRIMARY KEY AUTO_INCREMENT,
        first_name VARCHAR(100) NOT NULL,
        last_name VARCHAR(100) NOT NULL,
        email VARCHAR(255) NOT NULL UNIQUE,
        phone_number VARCHAR(20) NOT NULL UNIQUE,
        password_hash VARCHAR(255) NOT NULL,
        id_type VARCHAR(50) NOT NULL,
        id_number VARCHAR(50) NOT NULL UNIQUE,
        documents_folder VARCHAR(255),
        status ENUM('pending', 'approved', 'rejected') DEFAULT 'pending',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
      )
    `);

    // Create DriverDocuments table if it doesn't exist
    await pool.query(`
      CREATE TABLE IF NOT EXISTS DriverDocuments (
        id INT PRIMARY KEY AUTO_INCREMENT,
        driver_id INT NOT NULL,
        document_type ENUM('driver_photo', 'vehicle_license', 'driving_license', 'front_car_photo', 'back_car_photo', 'criminal_status_report') NOT NULL,
        file_name VARCHAR(255) NOT NULL,
        file_path VARCHAR(255) NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        FOREIGN KEY (driver_id) REFERENCES Drivers(id) ON DELETE CASCADE
      )
    `);

    // Create Feedback table if it doesn't exist
    await pool.query(`
      CREATE TABLE IF NOT EXISTS Feedback (
        id INT PRIMARY KEY AUTO_INCREMENT,
        user_id INT NOT NULL,
        user_type ENUM('passenger', 'driver') NOT NULL,
        rating INT NOT NULL CHECK (rating >= 1 AND rating <= 5),
        comment TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
      )
    `);

    // Add documents_folder column if it doesn't exist
    try {
      await pool.query(`
        ALTER TABLE Drivers 
        ADD COLUMN documents_folder VARCHAR(255)
      `);
    } catch (err) {
      // Column might already exist, ignore error
      console.log('Column documents_folder might already exist');
    }

    console.log('Database tables initialized successfully');
  } catch (error) {
    console.error('Error initializing database:', error);
    process.exit(1);
  }
}

// Initialize database on server start
initializeDatabase();

app.get('/', async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT 1 + 1 AS solution');
    res.send(`Connected to the MySQL database! Test query result: ${JSON.stringify(rows)}`);
  } catch (err) {
    console.error('Error querying the database:', err);
    res.status(500).send('Database connection error');
  }
});

// Passenger signup endpoint
app.post('/api/signup/passenger', async (req, res) => {
  const { full_name, email, phone_number, password } = req.body;

  if (!full_name || !email || !phone_number || !password) {
    return res.status(400).json({ message: 'All required passenger fields are missing' });
  }

  try {
    // Check if email or phone number already exists in Passengers table
    const [existingUsers] = await pool.query('SELECT id FROM Passengers WHERE email = ? OR phone_number = ?', [email, phone_number]);
    if (existingUsers.length > 0) {
      return res.status(409).json({ message: 'Email or phone number already exists (Passenger)' });
    }

    // Hash the password
    const saltRounds = 10;
    const passwordHash = await bcrypt.hash(password, saltRounds);

    // Insert the new passenger into the database
    const [result] = await pool.query('INSERT INTO Passengers (full_name, email, phone_number, password_hash) VALUES (?, ?, ?, ?)', [full_name, email, phone_number, passwordHash]);

    res.status(201).json({ message: 'Passenger registered successfully', userId: result.insertId });

  } catch (err) {
    console.error('Error during passenger signup:', err);
    res.status(500).json({ message: 'Failed to register passenger' });
  }
});

// Driver signup endpoint with file uploads
app.post('/api/signup/driver', upload.fields([
  { name: 'driverPhoto', maxCount: 1 },
  { name: 'vehicleLicense', maxCount: 1 },
  { name: 'drivingLicense', maxCount: 1 },
  { name: 'frontCarPhoto', maxCount: 1 },
  { name: 'backCarPhoto', maxCount: 1 },
  { name: 'criminalStatusReport', maxCount: 1 }
]), async (req, res) => {
  console.log('Received driver signup request:', {
    body: req.body,
    files: req.files
  });

  try {
    const { first_name, last_name, email, phone_number, password, id_type, id_number } = req.body;
    const files = req.files;

    // Validate required fields
    if (!first_name || !last_name || !email || !phone_number || !password || !id_type || !id_number) {
      console.error('Missing required fields:', { first_name, last_name, email, phone_number, id_type, id_number });
      return res.status(400).json({ message: 'All required driver fields are missing' });
    }

    // Validate required files
    const requiredFiles = ['driverPhoto', 'vehicleLicense', 'drivingLicense', 'frontCarPhoto', 'backCarPhoto'];
    const missingFiles = requiredFiles.filter(fileName => !files[fileName]);
    
    if (missingFiles.length > 0) {
      console.error('Missing required files:', missingFiles);
      return res.status(400).json({ message: `Missing required files: ${missingFiles.join(', ')}` });
    }

    // Check if email or phone number or ID number already exists
    const [existingDrivers] = await pool.query(
      'SELECT id FROM Drivers WHERE email = ? OR phone_number = ? OR id_number = ?',
      [email, phone_number, id_number]
    );

    if (existingDrivers.length > 0) {
      const [emailExists] = await pool.query('SELECT id FROM Drivers WHERE email = ?', [email]);
      const [phoneExists] = await pool.query('SELECT id FROM Drivers WHERE phone_number = ?', [phone_number]);
      const [idNumberExists] = await pool.query('SELECT id FROM Drivers WHERE id_number = ?', [id_number]);

      let message = 'Driver registration failed: ';
      if (emailExists.length > 0) message += 'Email already exists. ';
      if (phoneExists.length > 0) message += 'Phone number already exists. ';
      if (idNumberExists.length > 0) message += 'ID number already exists.';

      console.error('Registration conflict:', message);
      return res.status(409).json({ message });
    }

    // Hash the password
    const saltRounds = 10;
    const passwordHash = await bcrypt.hash(password, saltRounds);

    // Get the driver's folder path from the first uploaded file
    const driverFolder = path.dirname(files[Object.keys(files)[0]][0].path);
    const relativeFolderPath = path.relative(publicDir, driverFolder);

    // Start transaction
    await pool.query('START TRANSACTION');

    try {
      // Insert the new driver
      const [result] = await pool.query(
        'INSERT INTO Drivers (first_name, last_name, email, phone_number, password_hash, id_type, id_number, documents_folder) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
        [first_name, last_name, email, phone_number, passwordHash, id_type, id_number, relativeFolderPath]
      );

      const driverId = result.insertId;
      console.log('Driver record created with ID:', driverId);

      // Insert documents
      for (const [docType, fileArray] of Object.entries(files)) {
        const file = fileArray[0];
        console.log('Processing document:', { docType, file });
        
        const relativeFilePath = path.relative(publicDir, file.path);
        
        await pool.query(
          'INSERT INTO DriverDocuments (driver_id, document_type, file_name, file_path) VALUES (?, ?, ?, ?)',
          [driverId, docType, file.filename, relativeFilePath]
        );
        console.log('Document record created for:', docType);
      }

      await pool.query('COMMIT');
      console.log('Driver registration successful:', { driverId, email });
      res.status(201).json({ 
        message: 'Driver registered successfully', 
        driverId,
        documents: Object.fromEntries(
          Object.entries(files).map(([key, value]) => [key, path.relative(publicDir, value[0].path)])
        )
      });
    } catch (err) {
      await pool.query('ROLLBACK');
      console.error('Database error during driver registration:', err);
      throw err;
    }
  } catch (err) {
    console.error('Error during driver signup:', err);
    res.status(500).json({ 
      message: 'Failed to register driver', 
      error: err.message,
      details: err.stack
    });
  }
});

// Combined login endpoint for both passengers and drivers
app.post('/api/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: 'Email and password are required' });
    }

    // First check in Passengers table
    const [passengers] = await pool.query(
      'SELECT id, full_name as name, email, password_hash, "passenger" as role FROM Passengers WHERE email = ?',
      [email]
    );

    if (passengers.length > 0) {
      const passenger = passengers[0];
      const passwordMatch = await bcrypt.compare(password, passenger.password_hash);

      if (passwordMatch) {
        return res.status(200).json({
          message: 'Login successful',
          user: {
            id: passenger.id,
            name: passenger.name,
            email: passenger.email,
            role: 'passenger'
          }
        });
      } else {
        return res.status(401).json({ message: 'Invalid email or password' });
      }
    }

    // If not found in Passengers, check in Drivers table
    const [drivers] = await pool.query(
      'SELECT id, CONCAT(first_name, " ", last_name) as name, email, password_hash, "driver" as role, status FROM Drivers WHERE email = ?',
      [email]
    );

    if (drivers.length > 0) {
      const driver = drivers[0];
      const passwordMatch = await bcrypt.compare(password, driver.password_hash);

      if (passwordMatch) {
        // Check driver status
        if (driver.status === 'pending') {
          return res.status(403).json({
            message: 'Your account is pending approval. Please wait for admin verification.'
          });
        } else if (driver.status === 'rejected') {
          return res.status(403).json({
            message: 'Your account has been rejected. Please contact support for more information.'
          });
        }

        return res.status(200).json({
          message: 'Login successful',
          user: {
            id: driver.id,
            name: driver.name,
            email: driver.email,
            role: 'driver',
            status: driver.status
          }
        });
      } else {
        return res.status(401).json({ message: 'Invalid email or password' });
      }
    }

    // If we get here, the email wasn't found in either table
    return res.status(401).json({ message: 'Invalid email or password' });

  } catch (err) {
    console.error('Error during login:', err);
    return res.status(500).json({ 
      message: 'Failed to login',
      error: err.message 
    });
  }
});

// Feedback endpoints
app.post('/api/feedback', async (req, res) => {
  try {
    const { user_id, user_type, rating, comment } = req.body;

    // Validate required fields
    if (!user_id || !user_type || !rating) {
      return res.status(400).json({ message: 'User ID, user type, and rating are required' });
    }

    // Validate rating
    if (rating < 1 || rating > 5) {
      return res.status(400).json({ message: 'Rating must be between 1 and 5' });
    }

    // Insert feedback
    const [result] = await pool.query(
      'INSERT INTO Feedback (user_id, user_type, rating, comment) VALUES (?, ?, ?, ?)',
      [user_id, user_type, rating, comment]
    );

    res.status(201).json({
      message: 'Feedback submitted successfully',
      feedbackId: result.insertId
    });
  } catch (err) {
    console.error('Error submitting feedback:', err);
    res.status(500).json({ message: 'Failed to submit feedback' });
  }
});

// Get feedback for a user
app.get('/api/feedback/:userType/:userId', async (req, res) => {
  try {
    const { userType, userId } = req.params;

    const [feedback] = await pool.query(
      'SELECT * FROM Feedback WHERE user_type = ? AND user_id = ? ORDER BY created_at DESC',
      [userType, userId]
    );

    res.status(200).json(feedback);
  } catch (err) {
    console.error('Error fetching feedback:', err);
    res.status(500).json({ message: 'Failed to fetch feedback' });
  }
});

// Get all feedback (for admin)
app.get('/api/feedback', async (req, res) => {
  try {
    const [feedback] = await pool.query(
      'SELECT * FROM Feedback ORDER BY created_at DESC'
    );

    res.status(200).json(feedback);
  } catch (err) {
    console.error('Error fetching all feedback:', err);
    res.status(500).json({ message: 'Failed to fetch feedback' });
  }
});

// Get average rating for a user
app.get('/api/feedback/rating/:userType/:userId', async (req, res) => {
  try {
    const { userType, userId } = req.params;

    const [result] = await pool.query(
      'SELECT AVG(rating) as average_rating, COUNT(*) as total_ratings FROM Feedback WHERE user_type = ? AND user_id = ?',
      [userType, userId]
    );

    res.status(200).json(result[0]);
  } catch (err) {
    console.error('Error fetching rating:', err);
    res.status(500).json({ message: 'Failed to fetch rating' });
  }
});

const PORT = process.env.PORT || 3306;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
}); 