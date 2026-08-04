export const testData = {
  studentUser: {
    email: process.env.TEST_USER_EMAIL || 'student@college.edu',
    password: process.env.TEST_USER_PASSWORD || 'student123',
    name: 'Student Demo'
  },
  adminUser: {
    email: process.env.TEST_ADMIN_EMAIL || 'admin@college.edu',
    password: process.env.TEST_ADMIN_PASSWORD || 'admin123',
    name: 'Admin Demo'
  },
  facultyUser: {
    email: process.env.TEST_FACULTY_EMAIL || 'faculty@college.edu',
    password: process.env.TEST_FACULTY_PASSWORD || 'faculty123',
    name: 'Faculty Demo'
  },
  tempEvent: {
    title: 'Symposium Test E2E',
    shortDesc: 'Verification short description.',
    desc: 'Verification detailed description.',
    venue: 'Main Seminar Hall',
    venueAddress: 'Block 2, Second Floor',
    organizer: 'CSE Tech Society',
    orgEmail: 'cse-society@college.edu',
    orgPhone: '+91 98765 43210',
    capacity: '150',
    price: '0',
    tags: 'tech, seminar, e2e'
  }
};
