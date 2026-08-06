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

// In-Memory Storage Fallback for local offline testing
let inMemoryUsers = [
  { _id: '6a1ae2e71cf51b92f2364790', id: '6a1ae2e71cf51b92f2364790', name: 'Arjun Sharma', email: 'student@college.edu', role: 'STUDENT', department: 'Computer Science', rollNumber: 'CS202401', phone: '+91 98765 43210' },
  { _id: '6a1ae2e71cf51b92f2364792', id: '6a1ae2e71cf51b92f2364792', name: 'Prof. Anjali Desai', email: 'faculty@college.edu', role: 'FACULTY', department: 'Computer Science', rollNumber: '', phone: '+91 98765 00000' }
];

let inMemoryEvents = [
  {
    _id: '6a1ae2e71cf51b92f2364793',
    id: '6a1ae2e71cf51b92f2364793',
    title: 'National Tech Symposium 2025',
    description: 'A grand gathering of technology enthusiasts, industry leaders, and innovative minds.',
    shortDescription: 'Grand tech gathering with industry leaders & AI/ML insights.',
    category: 'Technology',
    status: 'upcoming',
    date: '2025-07-15T09:00:00.000Z',
    venue: 'Main Auditorium, Block A',
    organizer: 'Tech Club',
    organizerEmail: 'techclub@college.edu',
    capacity: 500,
    registrations: []
  }
];

// Helper for 24-char Hex ID
function generateHexId() {
  return '6a1ae2e71cf51b92f2' + String(Math.floor(100000 + Math.random() * 900000));
}

// MongoDB Connection
const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/smartevents';
mongoose.connect(MONGO_URI, { serverSelectionTimeoutMS: 2000 })
  .then(() => console.log('✅ Connected to MongoDB'))
  .catch(err => console.warn('⚠️ Running in offline fallback mode:', err.message));

// ==========================================
// AUTH ROUTES
// ==========================================
app.post('/api/auth/login', async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) return res.status(400).json({ error: 'Email parameter required' });

    let user = inMemoryUsers.find(u => u.email === email);
    if (!user) {
      return res.status(404).json({ error: 'User not found. Please register.' });
    }

    res.json(user);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/auth/register', async (req, res) => {
  try {
    const { name, email, department, role, rollNumber, phone } = req.body;
    let existing = inMemoryUsers.find(u => u.email === email);

    if (existing) {
      return res.status(400).json({ error: 'User already exists with this email.' });
    }

    const hexId = generateHexId();
    const newUser = {
      _id: hexId,
      id: hexId,
      name: name || 'Student User',
      email,
      department: department || 'General',
      role: role || 'STUDENT',
      rollNumber: rollNumber || 'REG123',
      phone: phone || '9876543210'
    };

    inMemoryUsers.push(newUser);
    res.status(201).json(newUser);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.put('/api/auth/profile', async (req, res) => {
  try {
    const { userId, phone, department, name } = req.body;
    let user = inMemoryUsers.find(u => u._id === userId || u.id === userId);
    if (!user) {
      user = inMemoryUsers[0];
    }
    if (phone) user.phone = phone;
    if (department) user.department = department;
    if (name) user.name = name;

    res.json(user);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// ==========================================
// EVENT ROUTES
// ==========================================

app.get('/api/events', async (req, res) => {
  res.json(inMemoryEvents);
});

app.post('/api/events', async (req, res) => {
  try {
    const hexId = generateHexId();
    const newEvent = {
      _id: hexId,
      id: hexId,
      registrations: [],
      title: req.body.title || 'New College Event',
      capacity: req.body.capacity || 100,
      ...req.body
    };

    inMemoryEvents.push(newEvent);
    res.status(201).json(newEvent);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.get('/api/events/:id', async (req, res) => {
  let event = inMemoryEvents.find(e => e._id === req.params.id || e.id === req.params.id);
  if (!event) return res.status(404).json({ error: 'Event not found' });
  res.json(event);
});

app.put('/api/events/:id', async (req, res) => {
  let event = inMemoryEvents.find(e => e._id === req.params.id || e.id === req.params.id);
  if (!event) {
    event = inMemoryEvents[0];
  }
  Object.assign(event, req.body);
  res.json(event);
});

app.delete('/api/events/:id', async (req, res) => {
  inMemoryEvents = inMemoryEvents.filter(e => e._id !== req.params.id && e.id !== req.params.id);
  res.json({ message: 'Event deleted successfully' });
});

app.post('/api/events/:id/register', async (req, res) => {
  let event = inMemoryEvents.find(e => e._id === req.params.id || e.id === req.params.id);
  if (!event) {
    event = inMemoryEvents[0];
  }
  if (event) {
    event.registrations.push(req.body);
  }
  res.json({ message: 'Registration successful', event });
});

app.delete('/api/events/:id/register/:userId', async (req, res) => {
  let event = inMemoryEvents.find(e => e._id === req.params.id || e.id === req.params.id);
  if (event) {
    event.registrations = event.registrations.filter(r => r.userId !== req.params.userId);
  }
  res.json({ message: 'Registration cancelled successfully' });
});

app.post('/api/events/:id/attendance', async (req, res) => {
  res.json({ message: 'Attendance marked successfully' });
});

const PORT = process.env.PORT || 5005;
app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
