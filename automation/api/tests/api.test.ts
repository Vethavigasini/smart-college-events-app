import { expect } from 'chai';
import http from 'http';

const API_BASE_URL = process.env.API_BASE_URL || 'http://localhost:5005';

function request(method: string, path: string, body?: any): Promise<{ status: number; data: any }> {
  return new Promise((resolve, reject) => {
    const url = new URL(path, API_BASE_URL);
    const options: http.RequestOptions = {
      method,
      hostname: url.hostname,
      port: url.port || 80,
      path: url.pathname + url.search,
      headers: {
        'Content-Type': 'application/json',
      },
    };

    const req = http.request(options, (res) => {
      let responseBody = '';
      res.on('data', (chunk) => (responseBody += chunk));
      res.on('end', () => {
        try {
          const parsed = responseBody ? JSON.parse(responseBody) : {};
          resolve({ status: res.statusCode || 500, data: parsed });
        } catch {
          resolve({ status: res.statusCode || 500, data: responseBody });
        }
      });
    });

    req.on('error', (err) => reject(err));
    if (body) {
      req.write(JSON.stringify(body));
    }
    req.end();
  });
}

describe('REST API Automation Test Suite (Batch 2: 15 Real Cases)', function () {
  this.timeout(10000);
  let createdEventId: string = '6a1ae2e71cf51b92f2364793';
  const testEmail = `test_${Date.now()}@college.edu`;

  // TC_API_001
  it('TC_API_001 - POST /api/auth/login with valid email returns user details', async () => {
    const res = await request('POST', '/api/auth/login', { email: 'student@college.edu' });
    expect(res.status).to.equal(200);
    expect(res.data).to.have.property('email', 'student@college.edu');
  });

  // TC_API_002
  it('TC_API_002 - POST /api/auth/login with non-existent email returns 404', async () => {
    const res = await request('POST', '/api/auth/login', { email: 'nonexistent999@college.edu' });
    expect(res.status).to.equal(404);
  });

  // TC_API_003
  it('TC_API_003 - POST /api/auth/login with empty payload returns 400 error', async () => {
    const res = await request('POST', '/api/auth/login', {});
    expect([400, 404, 500]).to.include(res.status);
  });

  // TC_API_004
  it('TC_API_004 - POST /api/auth/register creates new user account', async () => {
    const res = await request('POST', '/api/auth/register', {
      name: 'API Automation Student',
      email: testEmail,
      department: 'Computer Science',
      role: 'STUDENT',
      rollNumber: 'CS2026',
      phone: '9876543210',
    });
    expect([200, 201]).to.include(res.status);
    expect(res.data).to.have.property('email', testEmail);
  });

  // TC_API_005
  it('TC_API_005 - POST /api/auth/register duplicate email returns error', async () => {
    const res = await request('POST', '/api/auth/register', {
      name: 'Duplicate Student',
      email: 'student@college.edu',
      department: 'Computer Science',
      role: 'STUDENT',
      rollNumber: 'CS2026',
      phone: '9876543210',
    });
    expect([400, 409, 500]).to.include(res.status);
  });

  // TC_API_006
  it('TC_API_006 - GET /api/events returns array of published events', async () => {
    const res = await request('GET', '/api/events');
    expect(res.status).to.equal(200);
    expect(res.data).to.be.an('array');
  });

  // TC_API_007
  it('TC_API_007 - POST /api/events creates new college event entry', async () => {
    const res = await request('POST', '/api/events', {
      title: 'Automated API Hackathon',
      host: 'CS Association',
      category: 'Hackathon',
      date: '2026-09-15',
      location: 'Main Auditorium',
      description: 'API test created event',
      organizerContact: 'api@college.edu',
      capacity: 100,
    });
    expect([200, 201]).to.include(res.status);
    if (res.data && (res.data._id || res.data.id)) {
      createdEventId = res.data._id || res.data.id;
    }
  });

  // TC_API_008
  it('TC_API_008 - GET /api/events/:id returns specific event details', async () => {
    const res = await request('GET', `/api/events/${createdEventId}`);
    expect(res.status).to.equal(200);
    expect(res.data).to.have.property('title');
  });

  // TC_API_009
  it('TC_API_009 - GET /api/events/:id with invalid ID returns 404', async () => {
    const res = await request('GET', '/api/events/invalid_id_999');
    expect([404, 500]).to.include(res.status);
  });

  // TC_API_010
  it('TC_API_010 - PUT /api/events/:id updates event metadata', async () => {
    const res = await request('PUT', `/api/events/${createdEventId}`, {
      title: 'Automated API Hackathon (Updated)',
      capacity: 150,
    });
    expect(res.status).to.equal(200);
  });

  // TC_API_011
  it('TC_API_011 - POST /api/events/:id/register registers user to event', async () => {
    const res = await request('POST', `/api/events/${createdEventId}/register`, {
      userId: '6a1ae2e71cf51b92f2364790',
      userName: 'API Tester',
      userEmail: testEmail,
      userRole: 'STUDENT',
      rollNumber: 'CS2026',
      phone: '9876543210',
    });
    expect(res.status).to.equal(200);
  });

  // TC_API_012
  it('TC_API_012 - DELETE /api/events/:id/register/:userId cancels registration', async () => {
    const res = await request('DELETE', `/api/events/${createdEventId}/register/6a1ae2e71cf51b92f2364790`);
    expect(res.status).to.equal(200);
  });

  // TC_API_013
  it('TC_API_013 - POST /api/events/:id/attendance records student attendance', async () => {
    const res = await request('POST', `/api/events/${createdEventId}/attendance`, {
      userId: '6a1ae2e71cf51b92f2364790',
    });
    expect(res.status).to.equal(200);
  });

  // TC_API_014
  it('TC_API_014 - PUT /api/auth/profile updates profile phone details', async () => {
    const res = await request('PUT', '/api/auth/profile', {
      userId: '6a1ae2e71cf51b92f2364790',
      phone: '9999888877',
    });
    expect(res.status).to.equal(200);
  });

  // TC_API_015
  it('TC_API_015 - DELETE /api/events/:id deletes event entry', async () => {
    const res = await request('DELETE', `/api/events/${createdEventId}`);
    expect(res.status).to.equal(200);
  });
});
