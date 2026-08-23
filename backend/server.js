const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
require('dotenv').config();

const app = express();

const PORT = process.env.PORT || 5005;
const JWT_SECRET = process.env.JWT_SECRET;

if (!JWT_SECRET) {
  console.error('❌ JWT_SECRET is missing from .env');
  process.exit(1);
}

// ======================================================
// SECURITY MIDDLEWARE
// ======================================================

app.disable('x-powered-by');

app.use(
  helmet({
    crossOriginResourcePolicy: {
      policy: 'cross-origin'
    }
  })
);

const allowedOrigins = [
  'http://localhost:8081',
  'http://localhost:19006',
  'http://localhost:3000',
  'http://localhost:5005',
  'https://vethavigasini.github.io'
];

app.use(
  cors({
    origin(origin, callback) {
      if (!origin || allowedOrigins.includes(origin)) {
        return callback(null, true);
      }

      return callback(new Error('Origin not allowed by CORS'));
    },
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    allowedHeaders: ['Content-Type', 'Authorization']
  })
);

app.use(express.json({ limit: '1mb' }));

// Global API limiter
const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 200,
  standardHeaders: 'draft-8',
  legacyHeaders: false,
  message: {
    error: 'Too many requests. Please try again later.'
  }
});

// Stricter authentication limiter
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 20,
  standardHeaders: 'draft-8',
  legacyHeaders: false,
  message: {
    error: 'Too many authentication attempts. Please try again later.'
  }
});

app.use('/api', apiLimiter);
app.use('/api/auth/login', authLimiter);
app.use('/api/auth/register', authLimiter);

// ======================================================
// INPUT SECURITY
// ======================================================

function containsDangerousMongoKey(value) {
  if (Array.isArray(value)) {
    return value.some(containsDangerousMongoKey);
  }

  if (value && typeof value === 'object') {
    return Object.entries(value).some(([key, nestedValue]) => {
      if (key.startsWith('$') || key.includes('.')) {
        return true;
      }

      return containsDangerousMongoKey(nestedValue);
    });
  }

  return false;
}

app.use((req, res, next) => {
  if (
    containsDangerousMongoKey(req.body) ||
    containsDangerousMongoKey(req.query) ||
    containsDangerousMongoKey(req.params)
  ) {
    return res.status(400).json({
      error: 'Invalid request parameters'
    });
  }

  next();
});

function cleanString(value, maxLength = 500) {
  if (typeof value !== 'string') {
    return '';
  }

  return value.trim().slice(0, maxLength);
}

function isValidEmail(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

// ======================================================
// AUTHENTICATION / AUTHORIZATION
// ======================================================

function createToken(user) {
  return jwt.sign(
    {
      sub: user.id,
      email: user.email,
      role: user.role
    },
    JWT_SECRET,
    {
      expiresIn: '2h',
      issuer: 'smart-college-events'
    }
  );
}

function authenticateToken(req, res, next) {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({
      error: 'Authentication required'
    });
  }

  const token = authHeader.substring(7);

  try {
    req.user = jwt.verify(token, JWT_SECRET, {
      issuer: 'smart-college-events'
    });

    next();
  } catch (error) {
    return res.status(401).json({
      error: 'Invalid or expired authentication token'
    });
  }
}

function requireRole(...allowedRoles) {
  return (req, res, next) => {
    if (!req.user || !allowedRoles.includes(req.user.role)) {
      return res.status(403).json({
        error: 'You are not authorized to perform this action'
      });
    }

    next();
  };
}

// ======================================================
// IN-MEMORY DEMO STORAGE
// ======================================================

let inMemoryUsers = [];

let inMemoryEvents = [
  {
    _id: '6a1ae2e71cf51b92f2364793',
    id: '6a1ae2e71cf51b92f2364793',
    title: 'National Tech Symposium 2025',
    description:
      'A grand gathering of technology enthusiasts, industry leaders, and innovative minds.',
    shortDescription:
      'Grand tech gathering with industry leaders & AI/ML insights.',
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

function generateHexId() {
  return (
    '6a1ae2e71cf51b92f2' +
    String(Math.floor(100000 + Math.random() * 900000))
  );
}

async function createDemoUsers() {
  const studentPassword = process.env.DEMO_STUDENT_PASSWORD;
  const facultyPassword = process.env.DEMO_FACULTY_PASSWORD;

  if (!studentPassword || !facultyPassword) {
    console.error(
      '❌ DEMO_STUDENT_PASSWORD and DEMO_FACULTY_PASSWORD must be set in .env'
    );
    process.exit(1);
  }

  inMemoryUsers = [
    {
      _id: '6a1ae2e71cf51b92f2364790',
      id: '6a1ae2e71cf51b92f2364790',
      name: 'Arjun Sharma',
      email: 'student@college.edu',
      passwordHash: await bcrypt.hash(studentPassword, 12),
      role: 'STUDENT',
      department: 'Computer Science',
      rollNumber: 'CS202401',
      phone: '+91 98765 43210'
    },
    {
      _id: '6a1ae2e71cf51b92f2364792',
      id: '6a1ae2e71cf51b92f2364792',
      name: 'Prof. Anjali Desai',
      email: 'faculty@college.edu',
      passwordHash: await bcrypt.hash(facultyPassword, 12),
      role: 'FACULTY',
      department: 'Computer Science',
      rollNumber: '',
      phone: '+91 98765 00000'
    }
  ];
}

function publicUser(user) {
  const { passwordHash, ...safeUser } = user;
  return safeUser;
}

// ======================================================
// DATABASE CONNECTION
// ======================================================

const MONGO_URI =
  process.env.MONGO_URI || 'mongodb://localhost:27017/smartevents';

mongoose
  .connect(MONGO_URI, {
    serverSelectionTimeoutMS: 2000
  })
  .then(() => console.log('✅ Connected to MongoDB'))
  .catch((err) =>
    console.warn('⚠️ Running in offline fallback mode:', err.message)
  );

// ======================================================
// AUTH ROUTES
// ======================================================

app.post('/api/auth/login', async (req, res) => {
  try {
    const email = cleanString(req.body.email, 254).toLowerCase();
    const password =
      typeof req.body.password === 'string' ? req.body.password : '';

    if (!email || !password) {
      return res.status(400).json({
        error: 'Email and password are required'
      });
    }

    if (!isValidEmail(email)) {
      return res.status(400).json({
        error: 'Invalid email format'
      });
    }

    const user = inMemoryUsers.find(
      (candidate) => candidate.email.toLowerCase() === email
    );

    if (!user) {
      return res.status(401).json({
        error: 'Invalid email or password'
      });
    }

    const passwordMatches = await bcrypt.compare(
      password,
      user.passwordHash
    );

    if (!passwordMatches) {
      return res.status(401).json({
        error: 'Invalid email or password'
      });
    }

    const token = createToken(user);

    return res.json({
      token,
      user: publicUser(user)
    });
  } catch (error) {
    console.error(error);

    return res.status(500).json({
      error: 'Authentication failed'
    });
  }
});

app.post('/api/auth/register', async (req, res) => {
  try {
    const name = cleanString(req.body.name, 100);
    const email = cleanString(req.body.email, 254).toLowerCase();
    const department = cleanString(req.body.department, 100);
    const rollNumber = cleanString(req.body.rollNumber, 50);
    const phone = cleanString(req.body.phone, 30);

    const password =
      typeof req.body.password === 'string' ? req.body.password : '';

    if (!name || !email || !password) {
      return res.status(400).json({
        error: 'Name, email and password are required'
      });
    }

    if (!isValidEmail(email)) {
      return res.status(400).json({
        error: 'Invalid email format'
      });
    }

    if (password.length < 8) {
      return res.status(400).json({
        error: 'Password must contain at least 8 characters'
      });
    }

    const existing = inMemoryUsers.find(
      (candidate) => candidate.email.toLowerCase() === email
    );

    if (existing) {
      return res.status(409).json({
        error: 'User already exists with this email'
      });
    }

    const hexId = generateHexId();

    const newUser = {
      _id: hexId,
      id: hexId,
      name,
      email,
      passwordHash: await bcrypt.hash(password, 12),
      department: department || 'General',
      role: 'STUDENT',
      rollNumber: rollNumber || 'REG123',
      phone
    };

    inMemoryUsers.push(newUser);

    const token = createToken(newUser);

    return res.status(201).json({
      token,
      user: publicUser(newUser)
    });
  } catch (error) {
    console.error(error);

    return res.status(500).json({
      error: 'Registration failed'
    });
  }
});

app.put('/api/auth/profile', authenticateToken, async (req, res) => {
  try {
    const user = inMemoryUsers.find(
      (candidate) => candidate.id === req.user.sub
    );

    if (!user) {
      return res.status(404).json({
        error: 'User not found'
      });
    }

    if (req.body.phone !== undefined) {
      user.phone = cleanString(req.body.phone, 30);
    }

    if (req.body.department !== undefined) {
      user.department = cleanString(req.body.department, 100);
    }

    if (req.body.name !== undefined) {
      user.name = cleanString(req.body.name, 100);
    }

    return res.json(publicUser(user));
  } catch (error) {
    console.error(error);

    return res.status(500).json({
      error: 'Unable to update profile'
    });
  }
});

// ======================================================
// EVENT ROUTES
// ======================================================

app.get('/api/events', (req, res) => {
  res.json(inMemoryEvents);
});

app.get('/api/events/:id', (req, res) => {
  const event = inMemoryEvents.find(
    (candidate) =>
      candidate._id === req.params.id ||
      candidate.id === req.params.id
  );

  if (!event) {
    return res.status(404).json({
      error: 'Event not found'
    });
  }

  res.json(event);
});

app.post(
  '/api/events',
  authenticateToken,
  requireRole('ADMIN', 'FACULTY'),
  (req, res) => {
    try {
      const title = cleanString(req.body.title, 150);

      if (!title) {
        return res.status(400).json({
          error: 'Event title is required'
        });
      }

      const hexId = generateHexId();

      const newEvent = {
        _id: hexId,
        id: hexId,
        registrations: [],
        title,
        description: cleanString(req.body.description, 5000),
        shortDescription: cleanString(req.body.shortDescription, 500),
        category: cleanString(req.body.category, 100),
        status: cleanString(req.body.status, 30) || 'upcoming',
        date: cleanString(req.body.date, 100),
        venue: cleanString(req.body.venue, 300),
        organizer: cleanString(req.body.organizer, 150),
        organizerEmail: cleanString(req.body.organizerEmail, 254),
        capacity:
          Number.isFinite(Number(req.body.capacity)) &&
          Number(req.body.capacity) > 0
            ? Number(req.body.capacity)
            : 100
      };

      inMemoryEvents.push(newEvent);

      return res.status(201).json(newEvent);
    } catch (error) {
      console.error(error);

      return res.status(500).json({
        error: 'Unable to create event'
      });
    }
  }
);

app.put(
  '/api/events/:id',
  authenticateToken,
  requireRole('ADMIN', 'FACULTY'),
  (req, res) => {
    const event = inMemoryEvents.find(
      (candidate) =>
        candidate._id === req.params.id ||
        candidate.id === req.params.id
    );

    if (!event) {
      return res.status(404).json({
        error: 'Event not found'
      });
    }

    const allowedFields = [
      'title',
      'description',
      'shortDescription',
      'category',
      'status',
      'date',
      'venue',
      'organizer',
      'organizerEmail'
    ];

    for (const field of allowedFields) {
      if (req.body[field] !== undefined) {
        event[field] = cleanString(
          req.body[field],
          field === 'description' ? 5000 : 500
        );
      }
    }

    if (req.body.capacity !== undefined) {
      const capacity = Number(req.body.capacity);

      if (!Number.isFinite(capacity) || capacity <= 0) {
        return res.status(400).json({
          error: 'Invalid event capacity'
        });
      }

      event.capacity = capacity;
    }

    return res.json(event);
  }
);

app.delete(
  '/api/events/:id',
  authenticateToken,
  requireRole('ADMIN', 'FACULTY'),
  (req, res) => {
    const index = inMemoryEvents.findIndex(
      (candidate) =>
        candidate._id === req.params.id ||
        candidate.id === req.params.id
    );

    if (index === -1) {
      return res.status(404).json({
        error: 'Event not found'
      });
    }

    inMemoryEvents.splice(index, 1);

    return res.json({
      message: 'Event deleted successfully'
    });
  }
);

app.post(
  '/api/events/:id/register',
  authenticateToken,
  (req, res) => {
    const event = inMemoryEvents.find(
      (candidate) =>
        candidate._id === req.params.id ||
        candidate.id === req.params.id
    );

    if (!event) {
      return res.status(404).json({
        error: 'Event not found'
      });
    }

    const alreadyRegistered = event.registrations.some(
      (registration) => registration.userId === req.user.sub
    );

    if (alreadyRegistered) {
      return res.status(409).json({
        error: 'User is already registered'
      });
    }

    if (
      event.capacity &&
      event.registrations.length >= event.capacity
    ) {
      return res.status(409).json({
        error: 'Event capacity reached'
      });
    }

    event.registrations.push({
      userId: req.user.sub,
      registeredAt: new Date().toISOString()
    });

    return res.json({
      message: 'Registration successful',
      event
    });
  }
);

app.delete(
  '/api/events/:id/register/:userId',
  authenticateToken,
  (req, res) => {
    const requestedUserId = req.params.userId;

    const elevated =
      req.user.role === 'ADMIN' ||
      req.user.role === 'FACULTY';

    if (req.user.sub !== requestedUserId && !elevated) {
      return res.status(403).json({
        error: 'You cannot cancel another user registration'
      });
    }

    const event = inMemoryEvents.find(
      (candidate) =>
        candidate._id === req.params.id ||
        candidate.id === req.params.id
    );

    if (!event) {
      return res.status(404).json({
        error: 'Event not found'
      });
    }

    event.registrations = event.registrations.filter(
      (registration) =>
        registration.userId !== requestedUserId
    );

    return res.json({
      message: 'Registration cancelled successfully'
    });
  }
);

app.post(
  '/api/events/:id/attendance',
  authenticateToken,
  requireRole('ADMIN', 'FACULTY'),
  (req, res) => {
    const event = inMemoryEvents.find(
      (candidate) =>
        candidate._id === req.params.id ||
        candidate.id === req.params.id
    );

    if (!event) {
      return res.status(404).json({
        error: 'Event not found'
      });
    }

    return res.json({
      message: 'Attendance marked successfully'
    });
  }
);

// ======================================================
// SECURITY / HEALTH
// ======================================================

app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok'
  });
});

app.use((req, res) => {
  res.status(404).json({
    error: 'Route not found'
  });
});

app.use((error, req, res, next) => {
  if (error.message === 'Origin not allowed by CORS') {
    return res.status(403).json({
      error: 'Origin not allowed by CORS'
    });
  }

  console.error(error);

  return res.status(500).json({
    error: 'Internal server error'
  });
});

// ======================================================
// START SERVER
// ======================================================

async function startServer() {
  await createDemoUsers();

  app.listen(PORT, () => {
    console.log(`🚀 Server running on port ${PORT}`);
  });
}

startServer();