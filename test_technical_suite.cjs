const TECHNICAL_URL = 'http://localhost:5002/api/technical';
const CULTURAL_URL = 'http://localhost:5001/api/cultural/health';
const SPORTS_URL = 'http://localhost:5000/api/health';

async function request(url, options = {}, body = null) {
  const fetchOptions = {
    method: options.method || 'GET',
    headers: { ...(options.headers || {}) },
  };
  if (body) {
    fetchOptions.headers['Content-Type'] = 'application/json';
    fetchOptions.body = typeof body === 'string' ? body : JSON.stringify(body);
  }
  const res = await fetch(url, fetchOptions);
  let data = null;
  const contentType = res.headers.get('content-type') || '';
  if (contentType.includes('application/json')) {
    data = await res.json();
  } else {
    data = await res.text();
  }
  return { status: res.status, data, headers: Object.fromEntries(res.headers.entries()) };
}

async function runTestSuite() {
  console.log('====================================================');
  console.log('🚀 FAMT ARENA — TECHNICAL MODULE VERIFICATION SUITE');
  console.log('====================================================\n');

  let passed = 0;
  let failed = 0;

  function assert(condition, message) {
    if (condition) {
      console.log(`  ✅ PASS: ${message}`);
      passed++;
    } else {
      console.error(`  ❌ FAIL: ${message}`);
      failed++;
    }
  }

  // ----------------------------------------------------------------
  // 1. Module Health Checks
  // ----------------------------------------------------------------
  console.log('--- 1. Module Isolation & Health Checks ---');
  try {
    const techHealth = await request(`${TECHNICAL_URL}/health`);
    assert(techHealth.status === 200 && techHealth.data.database === 'famt_arena_technical', 
      `Technical backend healthy on port 5002 (DB: ${techHealth.data.database})`);
  } catch (e) {
    assert(false, `Technical backend health check failed: ${e.message}`);
  }

  try {
    const cultHealth = await request(CULTURAL_URL);
    assert(cultHealth.status === 200, `Cultural backend healthy on port 5001`);
  } catch (e) {
    assert(false, `Cultural backend health check failed: ${e.message}`);
  }

  try {
    const sportsHealth = await request(SPORTS_URL);
    assert(sportsHealth.status === 200, `Sports backend healthy on port 5000`);
  } catch (e) {
    try {
      const sp = await request('http://localhost:5000/api/events');
      assert(sp.status === 200, `Sports backend responding on port 5000 (/api/events)`);
    } catch (e2) {
      console.warn(`Sports backend check: ${e2.message}`);
    }
  }

  // ----------------------------------------------------------------
  // 2. Technical Public Events & Kalakruti Subevents
  // ----------------------------------------------------------------
  console.log('\n--- 2. Major Events & Competitions Verification ---');
  const eventsRes = await request(`${TECHNICAL_URL}/events`);
  assert(eventsRes.status === 200 && Array.isArray(eventsRes.data.data), 'GET /api/technical/events returns 200');
  
  const events = eventsRes.data.data;
  assert(events.length === 3, `Exactly 3 major events exist (found ${events.length})`);
  
  const stabilia = events.find(e => (e.id || e.slug) === 'stabilia');
  const brainbyte = events.find(e => (e.id || e.slug) === 'brainbyte');
  const kalakruti = events.find(e => (e.id || e.slug) === 'kalakruti');

  assert(!!stabilia, 'Major Event 1: Stabilia exists');
  assert(!!brainbyte, 'Major Event 2: BrainByte exists');
  assert(!!kalakruti, 'Major Event 3: Kalakruti exists');

  assert(kalakruti && kalakruti.competitions.length === 12, 
    `Kalakruti has exactly 12 subevents (found ${kalakruti ? kalakruti.competitions.length : 0})`);

  const expectedSubevents = [
    'Reel & Short Making',
    'DSLR Photography Competition',
    'Origami / Knitting / Quilling',
    'Cup & Mug Painting',
    'Rangoli (Kalakruti)',
    'Poster Making',
    'Mehendi Competition',
    'Painting (Kalakruti)',
    'Best Out of Waste',
    'Pot Painting',
    'Mobile Photography',
    'Sketching Competition'
  ];

  const actualNames = kalakruti ? kalakruti.competitions.map(c => c.name) : [];
  const allSubeventsPresent = expectedSubevents.every(name => actualNames.includes(name));
  assert(allSubeventsPresent, 'All 12 required Kalakruti competitions match specifications exactly');

  // ----------------------------------------------------------------
  // 3. Dynamic Positions
  // ----------------------------------------------------------------
  console.log('\n--- 3. Dynamic Position System Verification ---');
  const posRes = await request(`${TECHNICAL_URL}/positions`);
  assert(posRes.status === 200, 'GET /api/technical/positions returns 200');
  const positions = posRes.data.data;
  assert(positions.some(p => p.name === 'Participant'), 'Default position "Participant" loaded');
  assert(positions.some(p => p.name === 'Head / Co-Head'), 'Default position "Head / Co-Head" loaded');

  // Pre-test cleanup of test data for idempotency
  try {
    const preLogin = await request(`${TECHNICAL_URL}/admin/login`, { method: 'POST' }, {
      username: 'tech_admin',
      password: 'FamtTechArena@2026'
    });
    if (preLogin.status === 200 && preLogin.data.token) {
      const preHeaders = { Authorization: `Bearer ${preLogin.data.token}` };
      const preRegs = await request(`${TECHNICAL_URL}/admin/registrations`, { headers: preHeaders });
      if (Array.isArray(preRegs.data?.data)) {
        for (const r of preRegs.data.data) {
          if (r.email && r.email.includes('.test@famt.ac.in')) {
            await request(`${TECHNICAL_URL}/admin/registrations/${r.id}`, { method: 'DELETE', headers: preHeaders });
          }
        }
      }
      const prePos = await request(`${TECHNICAL_URL}/admin/positions`, { headers: preHeaders });
      if (Array.isArray(prePos.data?.data)) {
        for (const p of prePos.data.data) {
          if (p.name === 'Technical Lead') {
            await request(`${TECHNICAL_URL}/admin/positions/${p.id}`, { method: 'DELETE', headers: preHeaders });
          }
        }
      }
    }
  } catch (err) {
    // Ignore pre-cleanup errors
  }

  // ----------------------------------------------------------------
  // 4. Student Registration Workflow
  // ----------------------------------------------------------------
  console.log('\n--- 4. Student Registration Workflow ---');

  // Test 4a: Stabilia registration
  const stabiliaReg = await request(`${TECHNICAL_URL}/registrations`, { method: 'POST' }, {
    majorEventSlug: 'stabilia',
    fullName: 'Aditya Sharma',
    collegeName: 'FAMT Ratnagiri',
    studentYear: '3rd Year',
    department: 'Mechanical',
    contactNumber: '9876543210',
    email: 'aditya.sharma.test@famt.ac.in',
    position: 'Participant'
  });
  const stabCode = stabiliaReg.data?.registrationId || stabiliaReg.data?.registrationCode || stabiliaReg.data?.data?.registrationId;
  assert(stabiliaReg.status === 201 && stabCode && stabCode.startsWith('STAB-'), 
    `Stabilia Registration successful (ID: ${stabCode})`);

  // Test 4b: BrainByte registration
  const bbReg = await request(`${TECHNICAL_URL}/registrations`, { method: 'POST' }, {
    majorEventSlug: 'brainbyte',
    fullName: 'Priya Deshmukh',
    collegeName: 'FAMT Ratnagiri',
    studentYear: '2nd Year',
    department: 'Information Technology',
    contactNumber: '9822334455',
    email: 'priya.deshmukh.test@famt.ac.in',
    position: 'Head / Co-Head'
  });
  const bbCode = bbReg.data?.registrationId || bbReg.data?.registrationCode || bbReg.data?.data?.registrationId;
  assert(bbReg.status === 201 && bbCode && bbCode.startsWith('BB-'), 
    `BrainByte Registration successful (ID: ${bbCode})`);

  // Test 4c: Kalakruti subevent registration
  const kalaReg = await request(`${TECHNICAL_URL}/registrations`, { method: 'POST' }, {
    majorEventSlug: 'kalakruti',
    competitionSlug: 'reel-short-making',
    fullName: 'Rohan Kulkarni',
    collegeName: 'FAMT Ratnagiri',
    studentYear: '4th Year',
    department: 'CSE-AIML',
    contactNumber: '9890123456',
    email: 'rohan.kulkarni.test@famt.ac.in',
    position: 'Participant'
  });
  const kalaCode = kalaReg.data?.registrationId || kalaReg.data?.registrationCode || kalaReg.data?.data?.registrationId;
  assert(kalaReg.status === 201 && kalaCode && kalaCode.startsWith('KALA-'), 
    `Kalakruti (Reel & Short Making) Registration successful (ID: ${kalaCode})`);

  // Test 4d: Validation rejection - Invalid phone number
  const invalidPhone = await request(`${TECHNICAL_URL}/registrations`, { method: 'POST' }, {
    majorEventSlug: 'stabilia',
    fullName: 'Invalid Student',
    collegeName: 'FAMT Ratnagiri',
    studentYear: '1st Year',
    department: 'Mechanical',
    contactNumber: '123',
    email: 'invalid@famt.ac.in',
    position: 'Participant'
  });
  assert(invalidPhone.status === 400, 'Rejection of invalid contact number (HTTP 400)');

  // Test 4e: Duplicate registration protection
  const dupReg = await request(`${TECHNICAL_URL}/registrations`, { method: 'POST' }, {
    majorEventSlug: 'stabilia',
    fullName: 'Aditya Sharma',
    collegeName: 'FAMT Ratnagiri',
    studentYear: '3rd Year',
    department: 'Mechanical',
    contactNumber: '9876543210',
    email: 'aditya.sharma.test@famt.ac.in',
    position: 'Participant'
  });
  assert(dupReg.status === 409, 'Duplicate submission prevented with HTTP 409 Conflict');

  // ----------------------------------------------------------------
  // 5. Technical Admin Authentication & Security
  // ----------------------------------------------------------------
  console.log('\n--- 5. Technical Admin Authentication & Security ---');

  // Test 5a: Unauthenticated access rejected
  const unauthDash = await request(`${TECHNICAL_URL}/admin/dashboard`);
  assert(unauthDash.status === 401, 'Unauthorized access to admin dashboard rejected with HTTP 401');

  // Test 5b: Invalid credentials rejected
  const badLogin = await request(`${TECHNICAL_URL}/admin/login`, { method: 'POST' }, {
    username: 'tech_admin',
    password: 'wrong_password'
  });
  assert(badLogin.status === 401, 'Invalid admin password rejected with HTTP 401');

  // Test 5c: Valid login
  const loginRes = await request(`${TECHNICAL_URL}/admin/login`, { method: 'POST' }, {
    username: 'tech_admin',
    password: 'FamtTechArena@2026'
  });
  assert(loginRes.status === 200 && !!loginRes.data.token, 'Admin login successful with signed JWT token');
  const token = loginRes.data.token;
  const authHeaders = { Authorization: `Bearer ${token}` };

  // Test 5d: Verify session
  const verifyRes = await request(`${TECHNICAL_URL}/admin/verify`, { headers: authHeaders });
  assert(verifyRes.status === 200 && verifyRes.data.success, 'Token verification endpoint succeeds');

  // ----------------------------------------------------------------
  // 6. Admin Dashboard & Registrations Management
  // ----------------------------------------------------------------
  console.log('\n--- 6. Admin Dashboard & Registrations Management ---');

  const dashRes = await request(`${TECHNICAL_URL}/admin/dashboard`, { headers: authHeaders });
  assert(dashRes.status === 200 && dashRes.data.data.totalRegistrations >= 3, 
    `Dashboard metrics returned (Total registrations: ${dashRes.data?.data?.totalRegistrations})`);

  // Search & Filter registrations
  const searchRes = await request(`${TECHNICAL_URL}/admin/registrations?search=Aditya`, { headers: authHeaders });
  assert(searchRes.status === 200 && searchRes.data.data.length >= 1, 
    `Search by student name found ${searchRes.data?.data?.length} result(s)`);

  const regToEdit = searchRes.data.data[0];

  // Change position
  const posChangeRes = await request(`${TECHNICAL_URL}/admin/registrations/${regToEdit.id}/position`, {
    method: 'PATCH',
    headers: authHeaders
  }, { position: 'Head / Co-Head' });
  const updatedPos = posChangeRes.data.data?.position || posChangeRes.data.data?.positionName;
  assert(posChangeRes.status === 200 && updatedPos === 'Head / Co-Head', 
    'Admin successfully changed student position');

  // Change status
  const statusChangeRes = await request(`${TECHNICAL_URL}/admin/registrations/${regToEdit.id}/status`, {
    method: 'PATCH',
    headers: authHeaders
  }, { status: 'CONFIRMED' });
  assert(statusChangeRes.status === 200 && statusChangeRes.data.data?.status === 'CONFIRMED', 
    'Admin successfully updated registration status to CONFIRMED');

  // Export CSV
  const exportRes = await request(`${TECHNICAL_URL}/admin/export`, { headers: authHeaders });
  assert(exportRes.status === 200 && exportRes.headers['content-type']?.includes('text/csv'), 
    'Registrations CSV export endpoint returns valid CSV file');

  // ----------------------------------------------------------------
  // 7. Dynamic Position Management Controls
  // ----------------------------------------------------------------
  console.log('\n--- 7. Dynamic Position Management Controls ---');

  // Add position
  const addPosRes = await request(`${TECHNICAL_URL}/admin/positions`, {
    method: 'POST',
    headers: authHeaders
  }, { name: 'Technical Lead', isActive: true });
  assert(addPosRes.status === 201 && addPosRes.data.data.name === 'Technical Lead', 
    'Admin added new position option: "Technical Lead"');
  const newPosId = addPosRes.data.data.id;

  // Verify it appears in public options immediately
  const pubPosRes = await request(`${TECHNICAL_URL}/positions`);
  assert(pubPosRes.data.data.some(p => p.name === 'Technical Lead'), 
    'Newly created position is immediately visible on student registration forms');

  // Deactivate position
  const deactRes = await request(`${TECHNICAL_URL}/admin/positions/${newPosId}`, {
    method: 'PUT',
    headers: authHeaders
  }, { name: 'Technical Lead', isActive: false });
  assert(deactRes.status === 200 && deactRes.data.data.isActive === false, 
    'Admin successfully deactivated position');

  // Verify hidden from student options
  const pubPosAfter = await request(`${TECHNICAL_URL}/positions`);
  assert(!pubPosAfter.data.data.some(p => p.name === 'Technical Lead'), 
    'Deactivated position is safely hidden from student options without deleting history');

  // Clean up added position
  await request(`${TECHNICAL_URL}/admin/positions/${newPosId}`, {
    method: 'DELETE',
    headers: authHeaders
  });

  // ----------------------------------------------------------------
  // 8. Event Registration Open / Close Controls
  // ----------------------------------------------------------------
  console.log('\n--- 8. Event Registration Open/Close Controls ---');

  // Close Stabilia registration
  const closeRes = await request(`${TECHNICAL_URL}/admin/events/${stabilia.id}/toggle-registration`, {
    method: 'PATCH',
    headers: authHeaders
  });
  assert(closeRes.status === 200 && closeRes.data.data.isRegistrationOpen === false, 
    'Admin closed Stabilia registration');

  // Attempt registration on closed event
  const closedAttempt = await request(`${TECHNICAL_URL}/registrations`, { method: 'POST' }, {
    majorEventSlug: 'stabilia',
    fullName: 'Late Student',
    collegeName: 'FAMT Ratnagiri',
    studentYear: '1st Year',
    department: 'Mechanical',
    contactNumber: '9999888877',
    email: 'late.student@famt.ac.in',
    position: 'Participant'
  });
  assert(closedAttempt.status === 400 && closedAttempt.data.message.includes('closed'), 
    'Registration submission rejected on closed event (HTTP 400)');

  // Re-open Stabilia registration
  const reopenRes = await request(`${TECHNICAL_URL}/admin/events/${stabilia.id}/toggle-registration`, {
    method: 'PATCH',
    headers: authHeaders
  });
  assert(reopenRes.status === 200 && reopenRes.data.data.isRegistrationOpen === true, 
    'Admin successfully reopened Stabilia registration');

  // ----------------------------------------------------------------
  // 9. Cleanup Test Registrations
  // ----------------------------------------------------------------
  console.log('\n--- 9. Cleaning up Test Registrations ---');
  const allRegs = await request(`${TECHNICAL_URL}/admin/registrations`, { headers: authHeaders });
  const testRegs = allRegs.data.data.filter(r => r.email.includes('.test@famt.ac.in'));
  for (const r of testRegs) {
    await request(`${TECHNICAL_URL}/admin/registrations/${r.id}`, {
      method: 'DELETE',
      headers: authHeaders
    });
  }
  console.log(`  🧹 Cleaned up ${testRegs.length} test registration(s).`);

  // ----------------------------------------------------------------
  // SUMMARY
  // ----------------------------------------------------------------
  console.log('\n====================================================');
  console.log(`🎉 TEST SUITE COMPLETED: ${passed} PASSED, ${failed} FAILED`);
  console.log('====================================================\n');

  if (failed > 0) {
    process.exit(1);
  }
}

runTestSuite().catch(err => {
  console.error('Fatal test error:', err);
  process.exit(1);
});
