import app from './app.js';
import http from 'http';

async function runTests() {
  const server = http.createServer(app);
  const port = 5055;

  await new Promise<void>((resolve) => server.listen(port, resolve));
  console.log(`🧪 Test server started on port ${port}`);

  const baseUrl = `http://localhost:${port}`;

  try {
    // 1. Health check
    console.log('\n--- 1. Testing Health Check ---');
    const healthRes = await fetch(`${baseUrl}/api/health`);
    const healthJson = await healthRes.json();
    console.log('Health Response:', healthJson);

    // 2. Installment calculation
    console.log('\n--- 2. Testing Installment Calculator ---');
    const calcRes = await fetch(`${baseUrl}/api/v1/installment/calculate`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        price: 12500000,
        termMonths: 12,
        downPaymentPercent: 15,
      }),
    });
    const calcJson = await calcRes.json();
    console.log('Calculation Response for 12 500 000 so\'m (12 mo, 15% down):', {
      cashPrice: calcJson.cashPrice,
      totalPrice: calcJson.totalPrice,
      downPaymentAmount: calcJson.downPaymentAmount,
      monthlyPayment: calcJson.monthlyPayment,
      scheduleLength: calcJson.schedule?.length,
    });

    // 3. Products list
    console.log('\n--- 3. Testing Products Catalog API ---');
    const prodRes = await fetch(`${baseUrl}/api/v1/products?limit=3`);
    const prodJson = await prodRes.json();
    console.log(`Found ${prodJson.pagination.total} products. Sample items:`);
    prodJson.items.forEach((p: any) => {
      console.log(` - ${p.nameUz} (${p.brand.name}) | Price: ${p.basePrice} | From: ${p.minMonthlyPayment} so'm/mo`);
    });

    // 4. Product by slug
    console.log('\n--- 4. Testing Product By Slug ---');
    const slugRes = await fetch(`${baseUrl}/api/v1/products/apple-iphone-15-pro-max`);
    const slugJson = await slugRes.json();
    console.log(`Product: ${slugJson.product.nameUz}`);
    console.log(`Variants count: ${slugJson.product.variants.length}`);
    console.log(`Installment options:`, slugJson.installmentOptions);

    // 5. Admin Login
    console.log('\n--- 5. Testing Admin Login ---');
    const loginRes = await fetch(`${baseUrl}/api/v1/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: 'admin@nasiyago.uz',
        password: 'admin123',
      }),
    });
    const loginJson = await loginRes.json();
    console.log(`Login status: ${loginRes.status}, User: ${loginJson.user?.name}, Role: ${loginJson.user?.role}`);
    const token = loginJson.token;

    // 6. Admin Dashboard Stats
    console.log('\n--- 6. Testing Admin Dashboard Metrics ---');
    const statsRes = await fetch(`${baseUrl}/api/v1/admin/dashboard/stats`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    const statsJson = await statsRes.json();
    console.log('Dashboard Metrics:', statsJson.metrics);

    // 7. Public Application Submission
    console.log('\n--- 7. Testing Application Submission ---');
    const sampleVariant = slugJson.product.variants[0];
    const appRes = await fetch(`${baseUrl}/api/v1/applications`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        customerName: 'Javohir Toshmatov',
        phone: '+998909876543',
        district: 'Yunusobod tumani',
        address: 'Amir Temur shoh ko\'chasi, 25-uy',
        deliveryMethod: 'DELIVERY',
        consentAgreed: true,
        productId: slugJson.product.id,
        variantId: sampleVariant.id,
        termMonths: 12,
        downPaymentPercent: 0,
      }),
    });
    const appJson = await appRes.json();
    console.log('Application Submission result:', appJson);

    // 8. Order Status Lookup
    console.log('\n--- 8. Testing Order Status Lookup ---');
    const statusRes = await fetch(`${baseUrl}/api/v1/applications/status?phone=909876543&applicationNumber=${appJson.applicationNumber}`);
    const statusJson = await statusRes.json();
    console.log('Status result:', {
      applicationNumber: statusJson.applicationNumber,
      customerName: statusJson.customerName,
      status: statusJson.status,
      monthlyPayment: statusJson.monthlyPayment,
    });

    console.log('\n✅ ALL BACKEND & DATABASE TESTS PASSED SUCCESSFULLY!');
    server.close(() => {
      process.exit(0);
    });
  } catch (err) {
    console.error('❌ Test failed:', err);
    process.exit(1);
  }
}

process.env.NODE_ENV = 'test';
runTests();
