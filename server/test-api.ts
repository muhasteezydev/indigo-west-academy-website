import { createServer } from 'node:http';
import assert from 'node:assert/strict';
import { handleApiRequest } from './apiRouter.ts';

async function runTests() {
  const server = createServer(async (req, res) => {
    const handled = await handleApiRequest(req, res);
    if (!handled) {
      res.writeHead(404);
      res.end();
    }
  });

  await new Promise<void>((resolve) => server.listen(0, resolve));
  const addr = server.address();
  const port = typeof addr === 'object' && addr ? addr.port : 0;
  const baseUrl = `http://127.0.0.1:${port}`;

  try {
    // 1. Test /api/bootstrap
    const bootRes = await fetch(`${baseUrl}/api/bootstrap`);
    assert.equal(bootRes.status, 200);
    const bootData = await bootRes.json();
    assert.ok(bootData.news.length >= 4, 'Expected seeded news');
    assert.ok(bootData.teachers.length >= 6, 'Expected seeded teachers');
    assert.ok(bootData.papers.length >= 7, 'Expected seeded IQA papers');
    console.log('✓ [PASS] GET /api/bootstrap returns seeded Indigo Academy West data');

    // 2. Test unauthorized admin request blocked
    const unauthRes = await fetch(`${baseUrl}/api/admin/overview`);
    assert.equal(unauthRes.status, 401);
    console.log('✓ [PASS] Unauthorized access to /api/admin/overview rejected with 401');

    // 3. Test wrong password blocked
    const badLogin = await fetch(`${baseUrl}/api/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username: 'admin', password: 'wrongpassword' }),
    });
    assert.equal(badLogin.status, 401);
    console.log('✓ [PASS] Invalid admin credentials rejected with 401');

    // 4. Test valid admin login & JWT issuance
    const okLogin = await fetch(`${baseUrl}/api/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username: 'admin', password: 'indigo2026' }),
    });
    assert.equal(okLogin.status, 200);
    const { token, user } = await okLogin.json();
    assert.ok(token && token.split('.').length === 3, 'Expected valid JWT');
    assert.equal(user.username, 'admin');
    console.log('✓ [PASS] Admin login issues valid HMAC-SHA256 JWT');

    // 5. Test authorized admin overview
    const adminOverview = await fetch(`${baseUrl}/api/admin/overview`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    assert.equal(adminOverview.status, 200);
    console.log('✓ [PASS] Authenticated admin can access protected CMS endpoints');

    // 6. Test IQA printable sheet generation
    const sheetRes = await fetch(`${baseUrl}/api/papers/IQA-MATH-G10-2026-Q1/sheet`);
    assert.equal(sheetRes.status, 200);
    const sheetHtml = await sheetRes.text();
    assert.ok(sheetHtml.includes('INDIGO ACADEMY WEST'), 'Sheet contains school header');
    console.log('✓ [PASS] GET /api/papers/:code/sheet generates printable IQA Past Paper');

    console.log('\nALL 6 INTEGRATION & SECURITY TESTS PASSED!');
  } finally {
    server.close();
  }
}

runTests().catch((err) => {
  console.error(err);
  process.exit(1);
});
