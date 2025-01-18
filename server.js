const express = require('express'); 
const admin = require('firebase-admin');
const path = require('path');
const cors = require('cors');
const multer = require('multer'); // For handling file uploads
const fs = require('fs');

const app = express();
const port = process.env.PORT || 3000;

// Initialize Firebase Admin
const serviceAccount = require('./firebaseConfig.json');
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
});

const db = admin.firestore();

// Middleware
app.use(express.json());
app.use(cors());
app.use(express.static(path.join(__dirname, 'public')));

// Multer setup for file uploads
const upload = multer({ dest: 'uploads/' }); // Temporary storage directory

// Authentication Middleware
async function authenticateUser(req, res, next) {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  const token = authHeader.split('Bearer ')[1];
  try {
    const decodedToken = await admin.auth().verifyIdToken(token);
    req.user = decodedToken;
    console.log(`Authenticated user UID: ${decodedToken.uid}`);
    next();
  } catch (error) {
    console.error('Error verifying token:', error.message);
    res.status(401).json({ error: 'Invalid or expired token' });
  }
}

// Frontend Routes
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Registration Route
app.post('/api/register', async (req, res) => {
  const { email, password, name, roll } = req.body;

  try {
    // Create a new user in Firebase Authentication
    const userRecord = await admin.auth().createUser({ email, password });
    console.log(`Created user with UID: ${userRecord.uid}`);

    // Store student data in Firestore
    await db.collection('students').doc(userRecord.uid).set({
      name,
      roll,
      email,
    });

    res.status(201).json({
      message: 'User registered successfully!',
      userId: userRecord.uid,
    });
  } catch (error) {
    console.error('Error during registration:', error.message);
    res.status(400).json({
      error: error.message || 'Error registering user',
    });
  }
});

// Login Route
app.post('/api/login', async (req, res) => {
  const { idToken } = req.body;

  try {
    const decodedToken = await admin.auth().verifyIdToken(idToken);
    console.log(`Logged in user UID: ${decodedToken.uid}`);

    // Check if user exists in Firestore
    const studentDoc = await db.collection('students').doc(decodedToken.uid).get();

    if (!studentDoc.exists) {
      return res.status(404).json({ error: 'User not found in the database' });
    }

    res.status(200).json({
      message: 'Login successful!',
      userData: studentDoc.data(),
    });
  } catch (error) {
    console.error('Error during login:', error.message);
    res.status(401).json({
      error: error.message || 'Invalid or expired token',
    });
  }
});

// Student Data Route
app.get('/api/student-data', authenticateUser, async (req, res) => {
  try {
    const { uid } = req.user;
    console.log(`Fetching data for UID: ${uid}`);

    const studentDoc = await db.collection('students').doc(uid).get();

    if (!studentDoc.exists) {
      return res.status(404).json({ error: 'Student not found' });
    }

    res.status(200).json(studentDoc.data());
  } catch (error) {
    console.error('Error fetching student data:', error.message);
    res.status(500).json({
      error: 'Internal server error while fetching student data',
    });
  }
});

app.post('/api/add-item', upload.single('picture'), async (req, res) => {
  try {
    const { itemName, location, description, color, itemId } = req.body;
    const pictureFile = req.file;

    // Validate required fields
    if (!itemName || !location || !description || !color || !itemId) {
      return res.status(400).json({ message: 'All fields are required.' });
    }

    if (!pictureFile) {
      return res.status(400).json({ message: 'Picture is required.' });
    }

    // Convert the uploaded image to Base64
    const fileBuffer = fs.readFileSync(pictureFile.path);
    const base64Image = fileBuffer.toString('base64');
    const mimeType = pictureFile.mimetype; // e.g., "image/jpeg"

    // Prepare the data for Firestore
    const itemData = {
      itemName,
      location,
      description,
      color,
      itemId,
      pictureBase64: `data:${mimeType};base64,${base64Image}`,
      createdAt: new Date().toISOString(),
    };

    // Save the item data to Firestore
    await db.collection('items').add(itemData);

    // Delete the temporary file after encoding
    fs.unlinkSync(pictureFile.path);

    res.status(201).json({ message: 'Item added successfully!', item: itemData });
  } catch (error) {
    console.error('Error adding item:', error.message);
    res.status(500).json({ error: 'Failed to add item. Please try again.' });
  }
});

// New route to create a request for an item clicked
app.post('/api/create-request', authenticateUser, async (req, res) => {
  try {
    const { itemName, location, description, color, itemId } = req.body;
    const { uid } = req.user;  // Getting the user from the authentication middleware

    // Validate required fields
    if (!itemName || !location || !description || !color || !itemId) {
      return res.status(400).json({ message: 'All fields are required.' });
    }

    // Prepare the data to be added to the requests collection
    const requestData = {
      itemName,
      location,
      description,
      color,
      itemId,
      requestedBy: uid,  // User ID who created the request
      createdAt: new Date().toISOString(),
    };

    // Save the request data to the 'requests' collection in Firestore
    await db.collection('requests').add(requestData);

    res.status(201).json({ message: 'Request created successfully!', request: requestData });
  } catch (error) {
    console.error('Error creating request:', error.message);
    res.status(500).json({ error: 'Failed to create request. Please try again.' });
  }
});

// Start the server
app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});
