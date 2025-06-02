app.post('/api/signup/passenger', async (req, res) => {
  console.log('Received passenger signup request:', req.body);
  try {
    const { full_name, email, phone_number, password } = req.body;

    // Validate required fields
    if (!full_name || !email || !phone_number || !password) {
      console.error('Missing required fields:', { full_name, email, phone_number, password: !!password });
      return res.status(400).json({ message: 'All fields are required' });
    }

    // Check if email already exists
    const [existingUsers] = await pool.query(
      'SELECT * FROM users WHERE email = ?',
      [email]
    );

    if (existingUsers.length > 0) {
      console.error('Email already exists:', email);
      return res.status(400).json({ message: 'Email already registered' });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Insert new user
    const [result] = await pool.query(
      'INSERT INTO users (full_name, email, phone_number, password, role) VALUES (?, ?, ?, ?, ?)',
      [full_name, email, phone_number, hashedPassword, 'passenger']
    );

    console.log('Passenger signup successful:', { userId: result.insertId, email });
    res.status(201).json({ message: 'Passenger registered successfully' });
  } catch (error) {
    console.error('Error in passenger signup:', error);
    if (error.code === 'ER_DUP_ENTRY') {
      res.status(400).json({ message: 'Email already registered' });
    } else if (error.code === 'ER_NO_REFERENCED_ROW') {
      res.status(400).json({ message: 'Invalid data provided' });
    } else {
      res.status(500).json({ message: 'Error registering passenger' });
    }
  }
});

app.post('/api/signup/driver', upload.single('license_image'), async (req, res) => {
  console.log('Received driver signup request:', { ...req.body, file: req.file });
  try {
    const { full_name, email, phone_number, password, license_number, vehicle_type, vehicle_model, vehicle_color, vehicle_plate } = req.body;

    // Validate required fields
    if (!full_name || !email || !phone_number || !password || !license_number || !vehicle_type || !vehicle_model || !vehicle_color || !vehicle_plate || !req.file) {
      console.error('Missing required fields:', { 
        full_name, 
        email, 
        phone_number, 
        password: !!password,
        license_number,
        vehicle_type,
        vehicle_model,
        vehicle_color,
        vehicle_plate,
        hasFile: !!req.file
      });
      return res.status(400).json({ message: 'All fields are required' });
    }

    // Check if email already exists
    const [existingUsers] = await pool.query(
      'SELECT * FROM users WHERE email = ?',
      [email]
    );

    if (existingUsers.length > 0) {
      console.error('Email already exists:', email);
      return res.status(400).json({ message: 'Email already registered' });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Start transaction
    await pool.query('START TRANSACTION');

    try {
      // Insert new user
      const [userResult] = await pool.query(
        'INSERT INTO users (full_name, email, phone_number, password, role) VALUES (?, ?, ?, ?, ?)',
        [full_name, email, phone_number, hashedPassword, 'driver']
      );

      const userId = userResult.insertId;

      // Insert driver details
      await pool.query(
        'INSERT INTO drivers (user_id, license_number, license_image, vehicle_type, vehicle_model, vehicle_color, vehicle_plate) VALUES (?, ?, ?, ?, ?, ?, ?)',
        [userId, license_number, req.file.filename, vehicle_type, vehicle_model, vehicle_color, vehicle_plate]
      );

      await pool.query('COMMIT');
      console.log('Driver signup successful:', { userId, email });
      res.status(201).json({ message: 'Driver registered successfully' });
    } catch (error) {
      await pool.query('ROLLBACK');
      throw error;
    }
  } catch (error) {
    console.error('Error in driver signup:', error);
    if (error.code === 'ER_DUP_ENTRY') {
      res.status(400).json({ message: 'Email already registered' });
    } else if (error.code === 'ER_NO_REFERENCED_ROW') {
      res.status(400).json({ message: 'Invalid data provided' });
    } else {
      res.status(500).json({ message: 'Error registering driver' });
    }
  }
}); 