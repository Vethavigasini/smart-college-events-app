const dns = require('dns');
dns.setServers(['8.8.8.8', '8.8.4.4']);

const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config();

const User = require('./models/User');
const Event = require('./models/Event');

const app = express();

// Middleware
app.use(cors());
app.use(express.json({ limit: '50mb' }));
app.use((req, res, next) => { console.log(req.method, req.url); next(); });

// MongoDB Connection
const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/smartevents';
mongoose.connect(MONGO_URI)
  .then(() => console.log('✅ Connected to MongoDB'))
  .catch(err => console.error('❌ MongoDB connection error:', err));

// ==========================================
// AUTH ROUTES
// ==========================================
app.post('/api/auth/login', async (req, res) => {
  try {
    const { email } = req.body;
    let user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ error: 'User not found. Please register.' });
    }
    // Return user with mapped id to match frontend expectation
    const userObj = user.toObject();
    userObj.id = userObj._id.toString();
    res.json(userObj);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/auth/register', async (req, res) => {
  try {
    const { name, email, department, role, rollNumber, phone } = req.body;
    let user = await User.findOne({ email });
    if (user) {
      return res.status(400).json({ error: 'User already exists with this email.' });
    }
    
    user = new User({ name, email, department, role, rollNumber, phone });
    await user.save();
    
    const userObj = user.toObject();
    userObj.id = userObj._id.toString();
    res.status(201).json(userObj);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// ==========================================
// EVENT ROUTES
// ==========================================

// Get all events
app.get('/api/events', async (req, res) => {
  try {
    const events = await Event.find().select('-paymentQrCode -image').sort({ date: 1 });
    // Map _id to id for frontend
    const mappedEvents = events.map(e => {
      const obj = e.toObject();
      obj.id = obj._id.toString();
      // map registrations
      if (obj.registrations) {
        obj.registrations = obj.registrations.map(r => {
          r.id = r._id.toString();
          return r;
        });
      }
      return obj;
    });
    res.json(mappedEvents);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Create event
app.post('/api/events', async (req, res) => {
  try {
    const event = new Event(req.body);
    await event.save();
    const obj = event.toObject();
    obj.id = obj._id.toString();
    res.status(201).json(obj);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get single event
app.get('/api/events/:id', async (req, res) => {
  try {
    const event = await Event.findById(req.params.id);
    if (!event) return res.status(404).json({ error: 'Event not found' });
    const obj = event.toObject();
    obj.id = obj._id.toString();
    res.json(obj);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Update event
app.put('/api/events/:id', async (req, res) => {
  try {
    const event = await Event.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!event) return res.status(404).json({ error: 'Event not found' });
    const obj = event.toObject();
    obj.id = obj._id.toString();
    res.json(obj);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Delete event
app.delete('/api/events/:id', async (req, res) => {
  try {
    await Event.findByIdAndDelete(req.params.id);
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Register for event
app.post('/api/events/:id/register', async (req, res) => {
  try {
    const { userId, userName, userEmail, userPhone, department, paymentScreenshot } = req.body;
    
    const event = await Event.findById(req.params.id);
    if (!event) return res.status(404).json({ error: 'Event not found' });
    
    if (event.registeredCount >= event.capacity) {
      return res.status(400).json({ error: 'Event is at full capacity' });
    }
    
    // Check if already registered
    const existing = event.registrations.find(r => r.userId.toString() === userId);
    if (existing) {
      return res.status(400).json({ error: 'Already registered' });
    }
    
    event.registrations.push({
      userId, userName, userEmail, userPhone, department,
      // Don't store full base64 screenshot in MongoDB (exceeds 16MB BSON limit)
      // Store only a flag indicating payment was submitted
      paymentScreenshot: paymentScreenshot ? 'submitted' : '',
    });
    event.registeredCount += 1;
    
    await event.save();
    
    // Also update User
    await User.findByIdAndUpdate(userId, { $addToSet: { eventsRegistered: event._id } });
    
    const obj = event.toObject();
    obj.id = obj._id.toString();
    res.json({ success: true, event: obj });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Cancel Registration
app.delete('/api/events/:id/register/:userId', async (req, res) => {
  try {
    const { id, userId } = req.params;
    
    const event = await Event.findById(id);
    if (!event) return res.status(404).json({ error: 'Event not found' });
    
    event.registrations = event.registrations.filter(r => r.userId.toString() !== userId);
    event.registeredCount = Math.max(0, event.registeredCount - 1);
    
    await event.save();
    
    // Update User
    await User.findByIdAndUpdate(userId, { $pull: { eventsRegistered: event._id } });
    
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Mark attendance
app.post('/api/events/:id/attendance', async (req, res) => {
  try {
    const { userId } = req.body;
    
    const event = await Event.findById(req.params.id);
    if (!event) return res.status(404).json({ error: 'Event not found' });
    
    const registration = event.registrations.find(r => r.userId.toString() === userId);
    if (!registration) {
      return res.status(404).json({ error: 'Registration not found' });
    }
    
    registration.attended = true;
    if (!event.attendees.includes(userId)) {
      event.attendees.push(userId);
    }
    
    await event.save();
    
    // Update User
    await User.findByIdAndUpdate(userId, { $addToSet: { eventsAttended: event._id } });
    
    const obj = event.toObject();
    obj.id = obj._id.toString();
    res.json({ success: true, event: obj });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

const PORT = process.env.PORT || 5005;
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});

// Profile update route
app.put('/api/auth/profile', async (req, res) => {
  try {
    const { userId, ...updates } = req.body;
    if (!userId) {
      return res.status(400).json({ error: 'userId is required' });
    }
    const user = await User.findByIdAndUpdate(userId, updates, { new: true });
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    const userObj = user.toObject();
    userObj.id = userObj._id.toString();
    res.json(userObj);
  } catch (error) {
    console.error('Update profile error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get all users
app.get('/api/users', async (req, res) => {
  try {
    const users = await User.find({}).select('-password').lean();
    const mapped = users.map(u => ({ ...u, id: u._id.toString() }));
    res.json(mapped);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});
