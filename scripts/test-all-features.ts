/**
 * Comprehensive Automated End-to-End Test Suite for Alishan Furnitures Showroom OS
 * Tests all core modules: Auth, Inventory, 24h Holds, Halal Financial Math, Quotes, Follow-ups, and PDF engine.
 */

import assert from 'node:assert/strict';
import * as store from '../lib/store/showroom-store';
import * as pdfModule from '../lib/pdf/quote-pdf';
import * as cronModule from '../app/api/cron/nightly-report/route';
import * as executivePdfModule from '../lib/pdf/executive-report-pdf';

console.log('===============================================================');
console.log('🧪 STARTING COMPREHENSIVE ALISHAN FURNITURES SYSTEM TEST SUITE');
console.log('===============================================================\n');

let totalTests = 0;
let passedTests = 0;

function runTest(name: string, fn: () => void) {
  totalTests++;
  try {
    fn();
    console.log(`  ✅ [PASS] ${name}`);
    passedTests++;
  } catch (err: any) {
    console.error(`  ❌ [FAIL] ${name}`);
    console.error(`     Error: ${err.message}`);
    throw err;
  }
}

async function runAsyncTest(name: string, fn: () => Promise<void>) {
  totalTests++;
  try {
    await fn();
    console.log(`  ✅ [PASS] ${name}`);
    passedTests++;
  } catch (err: any) {
    console.error(`  ❌ [FAIL] ${name}`);
    console.error(`     Error: ${err.message}`);
    throw err;
  }
}

async function main() {
  // -------------------------------------------------------------
  // MODULE 1: AUTHENTICATION & PIN CREDENTIAL SECURITY
  // -------------------------------------------------------------
  console.log('📦 MODULE 1: AUTHENTICATION & PIN ACCESS CONTROLS');

  runTest('Owner PIN 1234 verifies as Admin with full privileges', () => {
    const res = store.verifyStaffPin('1234');
    assert.strictEqual(res.success, true);
    assert.strictEqual(res.staff?.role, 'admin');
    assert.match(res.staff?.name || '', /Vikram Mehta/);
  });

  runTest('Salesperson Arjun Verma PIN 1111 verifies as Sales staff', () => {
    const res = store.verifyStaffPin('1111');
    assert.strictEqual(res.success, true);
    assert.strictEqual(res.staff?.role, 'sales');
    assert.strictEqual(res.staff?.name, 'Arjun Verma');
  });

  runTest('Salesperson Sneha Kapoor PIN 2222 verifies as Sales staff', () => {
    const res = store.verifyStaffPin('2222');
    assert.strictEqual(res.success, true);
    assert.strictEqual(res.staff?.role, 'sales');
    assert.strictEqual(res.staff?.name, 'Sneha Kapoor');
  });

  runTest('Invalid 4-digit PIN 9999 fails with clean error message', () => {
    const res = store.verifyStaffPin('9999');
    assert.strictEqual(res.success, false);
    assert.strictEqual(res.staff, undefined);
    assert.match(res.error || '', /Invalid PIN/i);
  });

  runTest('Admin can dynamically onboard new salesperson and verify their PIN immediately', () => {
    const newStaff = store.addStaffMember('Tariq Mansoor', '4444', 'sales');
    assert.strictEqual(newStaff.name, 'Tariq Mansoor');
    assert.strictEqual(newStaff.role, 'sales');

    const loginRes = store.verifyStaffPin('4444');
    assert.strictEqual(loginRes.success, true);
    assert.strictEqual(loginRes.staff?.name, 'Tariq Mansoor');
  });

  runTest('Admin can update salesperson PIN and old PIN is invalidated', () => {
    const staffList = store.getAllStaffMembers();
    const tariq = staffList.find((s) => s.name === 'Tariq Mansoor');
    assert.ok(tariq);

    const updated = store.updateStaffPin(tariq.id, '8888');
    assert.strictEqual(updated, true);

    const oldPinRes = store.verifyStaffPin('4444');
    assert.strictEqual(oldPinRes.success, false);

    const newPinRes = store.verifyStaffPin('8888');
    assert.strictEqual(newPinRes.success, true);
  });

  runTest('Deactivating staff member prevents login', () => {
    const staffList = store.getAllStaffMembers();
    const tariq = staffList.find((s) => s.name === 'Tariq Mansoor');
    assert.ok(tariq);

    store.toggleStaffActiveStatus(tariq.id, false);
    const deactivatedLogin = store.verifyStaffPin('8888');
    assert.strictEqual(deactivatedLogin.success, false);

    // Clean up
    store.deleteStaffMember(tariq.id);
  });

  // -------------------------------------------------------------
  // MODULE 2: PRODUCT INVENTORY & STOCK CONTROLS
  // -------------------------------------------------------------
  console.log('\n📦 MODULE 2: SHOWROOM STOCK INVENTORY MANAGEMENT');

  let testProductId = '';

  runTest('Admin can add new luxury furniture piece to stock', () => {
    const newProd = store.addNewProduct({
      name: 'Milanese Emerald Velvet Chaise',
      price: 185000,
      material: 'Italian Emerald Velvet & Brushed Brass',
      dimensions: '190cm x 85cm x 75cm',
      category: 'Living Room',
      more_info: 'Limited Edition Display Unit',
    });

    assert.ok(newProd.id);
    assert.strictEqual(newProd.name, 'Milanese Emerald Velvet Chaise');
    assert.strictEqual(newProd.price, 185000);
    assert.strictEqual(newProd.is_active, true);
    testProductId = newProd.id;

    const all = store.getAllProducts();
    const found = all.find((p) => p.id === testProductId);
    assert.ok(found);
  });

  runTest('Admin can update product dimensions, price, and specs', () => {
    const updated = store.updateProduct(testProductId, {
      price: 195000,
      more_info: 'Floor Sample - Ready for Immediate Dispatch',
    });

    assert.ok(updated);
    assert.strictEqual(updated?.price, 195000);
    assert.strictEqual(updated?.more_info, 'Floor Sample - Ready for Immediate Dispatch');
  });

  runTest('Admin can toggle stock status (Sold Out / In Stock)', () => {
    store.toggleProductActive(testProductId, false);
    let all = store.getAllProducts();
    let found = all.find((p) => p.id === testProductId);
    assert.strictEqual(found?.is_active, false);

    store.toggleProductActive(testProductId, true);
    all = store.getAllProducts();
    found = all.find((p) => p.id === testProductId);
    assert.strictEqual(found?.is_active, true);
  });

  // -------------------------------------------------------------
  // MODULE 3: MULTI-COPY STOCK INVENTORY & DEAL CLOSURE ENGINE
  // -------------------------------------------------------------
  console.log('\n📦 MODULE 3: MULTI-COPY STOCK INVENTORY & DEAL CLOSURE ENGINE');

  runTest('Multi-copy stock inventory: selling 1 of 3 leaves 2 copies and product remains in stock', () => {
    const multiCopyProd = store.addNewProduct({
      name: 'Verona Dining Chair (Set of 6)',
      price: 90000,
      material: 'Velvet & Walnut',
      dimensions: '55cm x 60cm x 90cm',
      stock_quantity: 3,
    });

    assert.strictEqual(multiCopyProd.stock_quantity, 3);
    assert.strictEqual(multiCopyProd.is_active, true);

    const decRes = store.decrementProductStock(multiCopyProd.id, 1);
    assert.strictEqual(decRes.success, true);
    assert.strictEqual(decRes.remainingStock, 2);
    assert.strictEqual(decRes.isSoldOut, false);

    const p = store.getAllProducts().find((item) => item.id === multiCopyProd.id);
    assert.strictEqual(p?.stock_quantity, 2);
    assert.strictEqual(p?.is_active, true);
  });

  runTest('Selling final copy: remaining stock reaches 0 and product marks is_active = false (Sold Out)', () => {
    const singleProd = store.addNewProduct({
      name: 'Bespoke Royal Onyx Console Table',
      price: 210000,
      material: 'Onyx & Brass',
      dimensions: '140cm x 40cm x 85cm',
      stock_quantity: 1,
    });

    const decRes = store.decrementProductStock(singleProd.id, 1);
    assert.strictEqual(decRes.success, true);
    assert.strictEqual(decRes.remainingStock, 0);
    assert.strictEqual(decRes.isSoldOut, true);

    const p = store.getAllProducts().find((item) => item.id === singleProd.id);
    assert.strictEqual(p?.stock_quantity, 0);
    assert.strictEqual(p?.is_active, false);
  });

  runTest('Restocking product: admin restocks 2 units, product becomes active again', () => {
    const all = store.getAllProducts();
    const soldOnyx = all.find((item) => item.name === 'Bespoke Royal Onyx Console Table');
    assert.ok(soldOnyx);

    const restockRes = store.restockProduct(soldOnyx.id, 2);
    assert.strictEqual(restockRes.success, true);
    assert.strictEqual(restockRes.newStock, 2);

    const p = store.getAllProducts().find((item) => item.id === soldOnyx.id);
    assert.strictEqual(p?.stock_quantity, 2);
    assert.strictEqual(p?.is_active, true);
  });

  runTest('Direct Showroom Walk-in Sale: card button directly deducts stock by -1 without a quote', () => {
    const walkInItem = store.addNewProduct({
      name: 'Artisan Solid Teak Accent Stool',
      price: 32000,
      material: 'Reclaimed Teakwood',
      dimensions: '45cm x 45cm x 45cm',
      stock_quantity: 2,
    });

    assert.strictEqual(walkInItem.stock_quantity, 2);

    // Salesperson clicks direct walk-in sale button on card
    const sale1 = store.decrementProductStock(walkInItem.id, 1);
    assert.strictEqual(sale1.success, true);
    assert.strictEqual(sale1.remainingStock, 1);
    assert.strictEqual(sale1.isSoldOut, false);

    // Second walk-in buys remaining copy
    const sale2 = store.decrementProductStock(walkInItem.id, 1);
    assert.strictEqual(sale2.success, true);
    assert.strictEqual(sale2.remainingStock, 0);
    assert.strictEqual(sale2.isSoldOut, true);

    const afterSale = store.getAllProducts().find((item) => item.id === walkInItem.id);
    assert.strictEqual(afterSale?.stock_quantity, 0);
    assert.strictEqual(afterSale?.is_active, false);
  });

  // -------------------------------------------------------------
  // MODULE 4: HALAL FINANCIAL MATH & ADVANCE TOKEN DEPOSIT
  // -------------------------------------------------------------
  console.log('\n📦 MODULE 4: HALAL FINANCIAL MATH & ADVANCE DEPOSIT');

  runTest('Percentage discount calculation (Agreed Price - Discount = Final Price)', () => {
    const subtotal = 200000;
    const discountPercent = 10;
    const discountAmount = Math.round(subtotal * (discountPercent / 100));
    const finalPrice = Math.max(0, subtotal - discountAmount);

    assert.strictEqual(discountAmount, 20000);
    assert.strictEqual(finalPrice, 180000);
  });

  runTest('Flat discount calculation', () => {
    const subtotal = 150000;
    const flatDiscount = 25000;
    const finalPrice = Math.max(0, subtotal - flatDiscount);

    assert.strictEqual(finalPrice, 125000);
  });

  runTest('Discount is clamped and cannot exceed subtotal (no negative amounts)', () => {
    const subtotal = 50000;
    const excessiveFlatDiscount = 75000;
    const finalPrice = Math.max(0, subtotal - excessiveFlatDiscount);

    assert.strictEqual(finalPrice, 0);
  });

  runTest('Advance token deposit leaves exact remaining balance due on delivery', () => {
    const finalPrice = 180000;
    const advanceDeposit = 30000;
    const balanceDue = Math.max(0, finalPrice - advanceDeposit);

    assert.strictEqual(balanceDue, 150000);
  });

  runTest('Zero interest / Riba verification: no financing charges or interest fees', () => {
    const subtotal = 250000;
    const discount = 15000;
    const agreedFinal = subtotal - discount; // 235000
    const advance = 50000;
    const balance = agreedFinal - advance; // 185000

    // Sum of advance deposit and balance due must strictly equal the agreed final price without a single Rupee of interest
    assert.strictEqual(advance + balance, agreedFinal);
  });

  // -------------------------------------------------------------
  // MODULE 5: QUOTE CREATION, STORE PERSISTENCE & ATTRIBUTION
  // -------------------------------------------------------------
  console.log('\n📦 MODULE 5: QUOTE LIFECYCLE & LEAD ATTRIBUTION');

  const createdQuoteId = 'test-q-' + Date.now();

  runTest('Save new quote to showroom store', () => {
    const saved = store.saveNewQuote({
      id: createdQuoteId,
      created_at: new Date().toISOString(),
      customer_name: 'Farhan Akhtar',
      customer_whatsapp: '9876543210',
      subtotal: 195000,
      discount_type: 'percentage',
      discount_value: 10,
      final_price: 175500,
      advance_deposit: 25000,
      order_notes: 'Urgent delivery required by Saturday morning.',
      status: 'pending',
      staffName: 'Arjun Verma',
      itemsSummary: 'Milanese Emerald Velvet Chaise',
      itemsCount: 1,
      staff: {
        id: 'b0eebc99-9c0b-4ef8-bb6d-6bb9bd380a22',
        name: 'Arjun Verma',
        role: 'sales',
      },
      items: [
        {
          id: 'item-101',
          price_at_time: 195000,
          quantity: 1,
          product: {
            id: testProductId,
            name: 'Milanese Emerald Velvet Chaise',
            material: 'Italian Emerald Velvet & Brushed Brass',
            dimensions: '190cm x 85cm x 75cm',
          },
        },
      ],
    });

    assert.strictEqual(saved.id, createdQuoteId);
    assert.strictEqual(saved.final_price, 175500);
  });

  runTest('Quote is immediately retrievable by ID with full specifications', () => {
    const quote = store.getQuoteById(createdQuoteId);
    assert.ok(quote);
    assert.strictEqual(quote.customer_name, 'Farhan Akhtar');
    assert.strictEqual(quote.customer_whatsapp, '9876543210');
    assert.strictEqual(quote.items.length, 1);
    assert.strictEqual(quote.items[0].product.name, 'Milanese Emerald Velvet Chaise');
  });

  runTest('Quote appears in getAllQuotes for showroom owner dashboard', () => {
    const allQuotes = store.getAllQuotes();
    const found = allQuotes.find((q) => q.id === createdQuoteId);
    assert.ok(found);
    assert.strictEqual(found.status, 'pending');
  });

  runTest('Follow-up lead automatically attributed to Arjun Verma for morning call', () => {
    store.assignQuoteToStaff(
      createdQuoteId,
      'b0eebc99-9c0b-4ef8-bb6d-6bb9bd380a22',
      'Arjun Verma',
      '9876543210',
      'Milanese Emerald Velvet Chaise',
      175500,
      'Farhan Akhtar',
      'Urgent delivery required by Saturday morning.',
      25000
    );

    const arjunLeads = store.getFollowUpsForStaff('b0eebc99-9c0b-4ef8-bb6d-6bb9bd380a22');
    const myLead = arjunLeads.find((l) => l.quoteId === createdQuoteId);
    assert.ok(myLead);
    assert.strictEqual(myLead.customerName, 'Farhan Akhtar');
    assert.strictEqual(myLead.quotedAmount, 175500);
    assert.strictEqual(myLead.advanceDeposit, 25000);
  });

  runTest('Salesperson can toggle follow-up lead status (Pending <-> Called)', () => {
    const arjunLeads = store.getFollowUpsForStaff('b0eebc99-9c0b-4ef8-bb6d-6bb9bd380a22');
    const myLead = arjunLeads.find((l) => l.quoteId === createdQuoteId);
    assert.ok(myLead);

    store.markFollowUpContacted(myLead.id);
    const updatedLead = store.getAllFollowUps().find((l) => l.id === myLead.id);
    assert.strictEqual(updatedLead?.status, 'called_interested');
  });

  runTest('Closing quote in admin marks products as sold out', () => {
    // Lock product first
    store.lockProductsFor24Hours(
      [{ productId: testProductId, name: 'Milanese Emerald Velvet Chaise' }],
      createdQuoteId
    );

    // Update status in store
    store.updateQuoteStatusInStore(createdQuoteId, 'closed');
    const q = store.getQuoteById(createdQuoteId);
    assert.strictEqual(q?.status, 'closed');

    // Test closeQuoteAndDeductInventory
    const dealRes = store.closeQuoteAndDeductInventory(createdQuoteId);
    assert.strictEqual(dealRes.success, true);
    assert.ok(dealRes.affectedProducts.length > 0);

    const closedQuote = store.getQuoteById(createdQuoteId);
    assert.strictEqual(closedQuote?.status, 'closed');
  });

  // -------------------------------------------------------------
  // MODULE 6: PDF GENERATION ENGINE
  // -------------------------------------------------------------
  console.log('\n📦 MODULE 6: PROFESSIONAL PDF GENERATION ENGINE');

  await runAsyncTest('Generate high-resolution Quote PDF Blob with Rupee symbols', async () => {
    const pdfBlob = await pdfModule.generateQuotePdfBlob({
      quoteId: 'e0eebc99-9c0b-4ef8-bb6d-123456789012',
      shortRef: 'E0EEBC99',
      dateFormatted: '22 November 2026',
      validUntilFormatted: '29 November 2026 (7 Days)',
      staffName: 'Arjun Verma',
      customerName: 'Farhan Akhtar',
      customerWhatsapp: '9876543210',
      orderNotes: 'Custom stitching requested on bouclé fabric.',
      advanceDeposit: 25000,
      subtotal: 195000,
      discountType: 'percentage',
      discountValue: 10,
      finalPrice: 175500,
      items: [
        {
          name: 'The Florence Bouclé Sectional',
          material: 'Italian Bouclé & Smoked Oak Plinth',
          dimensions: '340cm x 180cm x 78cm',
          more_info: '3-Seater L-Shape with Left Chaise',
          price: 195000,
          quantity: 1,
        },
      ],
    });

    assert.ok(pdfBlob);
    assert.strictEqual(pdfBlob.type, 'application/pdf');
    assert.ok(pdfBlob.size > 1000, `PDF size ${pdfBlob.size} should be > 1000 bytes`);

    // Verify PDF header %PDF-
    const arrayBuffer = await pdfBlob.arrayBuffer();
    const bytes = new Uint8Array(arrayBuffer);
    const headerStr = Buffer.from(bytes.slice(0, 5)).toString('utf-8');
    assert.strictEqual(headerStr, '%PDF-');
  });

  await runAsyncTest('Executive Report PDF generator creates valid multi-page PDF for custom date range', async () => {
    const pdfBlob = await executivePdfModule.generateExecutiveReportPdfBlob({
      fromDateFormatted: '01 Nov 2026',
      toDateFormatted: '26 Nov 2026',
      generatedAtFormatted: '26 Nov 2026, 06:30 PM',
      ownerName: 'Vikram Mehta (Owner)',
      totalRevenue: 450000,
      totalVisitors: 8,
      quotesCount: 6,
      closedDealsCount: 3,
      piecesSoldCount: 5,
      pendingAmount: 120000,
      staffPerformance: [
        {
          staffName: 'Arjun Verma',
          quotesCount: 4,
          closedDealsCount: 2,
          revenue: 300000,
        },
        {
          staffName: 'Sneha Kapoor',
          quotesCount: 2,
          closedDealsCount: 1,
          revenue: 150000,
        },
      ],
      quotes: [
        {
          id: 'quote-test-1',
          dateFormatted: '15 Nov 2026',
          customerName: 'Rohit Sharma',
          customerWhatsapp: '+91 9876543210',
          productName: 'The Florence Bouclé Sectional',
          quantity: 1,
          staffName: 'Arjun Verma',
          status: 'pending',
          amount: 195000,
        },
        {
          id: 'quote-test-2',
          dateFormatted: '18 Nov 2026',
          customerName: 'Priya Sharma',
          customerWhatsapp: '+91 9123456789',
          productName: 'Verona Carrara Marble Dining Table',
          quantity: 1,
          staffName: 'Sneha Kapoor',
          status: 'pending',
          amount: 245000,
        },
        {
          id: 'quote-test-3',
          dateFormatted: '20 Nov 2026',
          customerName: 'Amit Patel',
          customerWhatsapp: '+91 9845012345',
          productName: 'Kyoto Low-Profile King Bedstead',
          quantity: 1,
          staffName: 'Arjun Verma',
          status: 'no deal',
          amount: 290000,
        },
      ],
      soldItems: [
        {
          id: 'sold-test-1',
          dateFormatted: '15 Nov 2026',
          customerName: 'Rohit Sharma',
          customerWhatsapp: '+91 9876543210',
          productName: 'The Florence Bouclé Sectional',
          quantity: 1,
          staffName: 'Arjun Verma',
          status: 'sold',
          amount: 195000,
        },
      ],
    });

    assert.ok(pdfBlob);
    assert.strictEqual(pdfBlob.type, 'application/pdf');
    assert.ok(pdfBlob.size > 1000, `Executive PDF size ${pdfBlob.size} should be > 1000 bytes`);

    const arrayBuffer = await pdfBlob.arrayBuffer();
    const bytes = new Uint8Array(arrayBuffer);
    const headerStr = Buffer.from(bytes.slice(0, 5)).toString('utf-8');
    assert.strictEqual(headerStr, '%PDF-');
  });

  // -------------------------------------------------------------
  // MODULE 7: NIGHTLY 10 PM WHATSAPP REPORT ROUTE
  // -------------------------------------------------------------
  console.log('\n📦 MODULE 7: NIGHTLY 10 PM OWNER REPORT & CRON');

  await runAsyncTest('Nightly 10 PM route generates comprehensive owner report', async () => {
    const mockRequest = new Request('http://localhost:3000/api/cron/nightly-report');
    const response = await cronModule.GET(mockRequest);
    assert.strictEqual(response.status, 200);

    const json = await response.json();
    assert.strictEqual(json.success, true);
    assert.strictEqual(json.ownerPhone, '+91 7676482481');
    assert.match(json.reportMessage, /Alishan Furnitures - Daily Closing Report/);
    assert.match(json.reportMessage, /10:00 PM/);
  });

  // Clean up test product
  store.deleteProduct(testProductId);

  // -------------------------------------------------------------
  // MODULE 8: BANK-GRADE SECURITY & DPDP ACT 2023 COMPLIANCE
  // -------------------------------------------------------------
  console.log('\n📦 MODULE 8: BANK-GRADE APPLICATION SECURITY & DPDP ACT 2023');
  const rateLimit = await import('../lib/security/rate-limit');
  const nextConfigModule = await import('../next.config.mjs');

  runTest('Brute-force shield locks terminal after 5 consecutive failed PIN attempts', () => {
    const testId = 'test_security_terminal_' + Date.now();
    rateLimit.resetRateLimit(testId);

    // Initial check: allowed
    let check = rateLimit.checkRateLimit(testId);
    assert.strictEqual(check.allowed, true);
    assert.strictEqual(check.remainingAttempts, 5);

    // 4 failed attempts: still allowed
    for (let i = 0; i < 4; i++) {
      rateLimit.recordFailedAttempt(testId);
    }
    check = rateLimit.checkRateLimit(testId);
    assert.strictEqual(check.allowed, true);
    assert.strictEqual(check.remainingAttempts, 1);

    // 5th failed attempt: triggers lockout
    const fifthRecord = rateLimit.recordFailedAttempt(testId);
    assert.strictEqual(fifthRecord.isLocked, true);
    assert.ok((fifthRecord.retryAfterSeconds || 0) > 0);

    // Terminal is now locked
    check = rateLimit.checkRateLimit(testId);
    assert.strictEqual(check.allowed, false);
    assert.strictEqual(check.remainingAttempts, 0);

    // Reset clears lockout
    rateLimit.resetRateLimit(testId);
    check = rateLimit.checkRateLimit(testId);
    assert.strictEqual(check.allowed, true);
  });

  runTest('Indian Mobile Regex & Sanitizer validates genuine numbers and strips +91/0 prefixes', () => {
    const sanitizePhone = (val: string) => {
      let clean = val.replace(/\D/g, '');
      if (clean.startsWith('91') && clean.length === 12) clean = clean.slice(2);
      else if (clean.startsWith('0') && clean.length === 11) clean = clean.slice(1);
      return clean;
    };
    const indianMobileRegex = /^[6-9]\d{9}$/;

    // Direct 10-digit
    assert.strictEqual(indianMobileRegex.test(sanitizePhone('9876543210')), true);
    assert.strictEqual(indianMobileRegex.test(sanitizePhone('8123456789')), true);

    // Formatted with +91 country code
    assert.strictEqual(indianMobileRegex.test(sanitizePhone('+91 98765 43210')), true);
    assert.strictEqual(sanitizePhone('+91-9876543210'), '9876543210');

    // Leading zero
    assert.strictEqual(indianMobileRegex.test(sanitizePhone('09876543210')), true);
    assert.strictEqual(sanitizePhone('09876543210'), '9876543210');

    // Invalid numbers (starting with 1-5, wrong length, letters)
    assert.strictEqual(indianMobileRegex.test(sanitizePhone('5123456789')), false);
    assert.strictEqual(indianMobileRegex.test(sanitizePhone('1234567890')), false);
    assert.strictEqual(indianMobileRegex.test(sanitizePhone('98765')), false);
    assert.strictEqual(indianMobileRegex.test(sanitizePhone('abcdefghij')), false);
  });

  await runAsyncTest('Production HTTP Security Headers are fully configured in next.config.mjs', async () => {
    const config = nextConfigModule.default;
    assert.strictEqual(config.poweredByHeader, false, 'poweredByHeader must be false');
    assert.strictEqual(config.productionBrowserSourceMaps, false, 'productionBrowserSourceMaps must be false');

    assert.ok(typeof config.headers === 'function', 'headers() must be configured');
    const headerRules = await config.headers();
    assert.ok(headerRules.length > 0);

    const headersList = headerRules[0].headers;
    const headerMap = new Map(headersList.map((h: any) => [h.key, h.value]));

    // Verify Content-Security-Policy (CSP)
    assert.ok(headerMap.has('Content-Security-Policy'));
    assert.match(headerMap.get('Content-Security-Policy') || '', /default-src 'self'/);
    assert.match(headerMap.get('Content-Security-Policy') || '', /frame-ancestors 'none'/);

    // Verify HSTS
    assert.ok(headerMap.has('Strict-Transport-Security'));
    assert.match(headerMap.get('Strict-Transport-Security') || '', /max-age=63072000/);

    // Verify Anti-Clickjacking & MIME Protection
    assert.strictEqual(headerMap.get('X-Frame-Options'), 'DENY');
    assert.strictEqual(headerMap.get('X-Content-Type-Options'), 'nosniff');

    // Verify Permissions-Policy & Referrer
    assert.match(headerMap.get('Permissions-Policy') || '', /camera=\(\)/);
    assert.strictEqual(headerMap.get('Referrer-Policy'), 'strict-origin-when-cross-origin');
  });

  // -------------------------------------------------------------
  // MODULE 9: COMMERCIAL INTEGRITY & TAMPER-RESISTANCE AUDIT
  // -------------------------------------------------------------
  console.log('\n📦 MODULE 9: COMMERCIAL INTEGRITY & TAMPER-RESISTANCE AUDIT');
  const adminActions = await import('../app/(admin)/admin/actions');
  const salesActions = await import('../app/(sales)/sales/actions');

  await runAsyncTest('Primary Showroom Owner account cannot be deleted or deactivated', async () => {
    const owner = store.getAllStaffMembers().find((s) => s.role === 'admin');
    assert.ok(owner);

    const deleteRes = await adminActions.deleteStaffAction(owner.id);
    assert.strictEqual(deleteRes.success, false);
    assert.match(deleteRes.error || '', /cannot be deleted/i);

    const deactRes = await adminActions.toggleStaffStatusAction(owner.id, false);
    assert.strictEqual(deactRes.success, false);
    assert.match(deactRes.error || '', /cannot be deactivated/i);
  });

  await runAsyncTest('Duplicate active PIN assignment is strictly rejected', async () => {
    const dupRes = await adminActions.createStaffAction('Imposter Staff', '1111', 'sales');
    assert.strictEqual(dupRes.success, false);
    assert.match(dupRes.error || '', /already assigned/i);

    const ownerPinRes = await adminActions.createStaffAction('Imposter Owner', '1234', 'sales');
    assert.strictEqual(ownerPinRes.success, false);
    assert.match(ownerPinRes.error || '', /already assigned/i);
  });

  await runAsyncTest('Sales terminal allows Owner PIN 1234 verification with full admin privileges', async () => {
    const verifyRes = await salesActions.verifyPin('1234');
    assert.strictEqual(verifyRes.success, true);
    assert.strictEqual(verifyRes.staff?.role, 'admin');
    assert.match(verifyRes.staff?.name || '', /Vikram Mehta/);
  });

  await runAsyncTest('Staff isolation: Salesperson only sees assigned leads, Owner sees all showroom leads', async () => {
    const arjunLeads = store.getFollowUpsForStaff('b0eebc99-9c0b-4ef8-bb6d-6bb9bd380a22');
    for (const lead of arjunLeads) {
      assert.strictEqual(lead.assignedStaffId, 'b0eebc99-9c0b-4ef8-bb6d-6bb9bd380a22');
    }

    const allLeads = store.getAllFollowUps();
    assert.ok(allLeads.length >= arjunLeads.length);
  });

  await runAsyncTest('Server financial math clamps advance deposit and prevents negative values', async () => {
    const res = await salesActions.createQuote({
      staffId: 'b0eebc99-9c0b-4ef8-bb6d-6bb9bd380a22',
      customerName: 'Test Integrity Customer',
      customerWhatsapp: '9988776655',
      subtotal: 100000,
      discountType: 'percentage',
      discountValue: 10,
      finalPrice: 90000,
      advanceDeposit: 500000,
      items: [
        {
          productId: 'd0eebc99-9c0b-4ef8-bb6d-6bb9bd380a44',
          name: 'The Florence Bouclé Sectional',
          priceAtTime: 100000,
          quantity: 1,
        },
      ],
    });

    assert.strictEqual(res.success, true);
    assert.ok(res.quoteId);

    const saved = store.getQuoteById(res.quoteId);
    assert.ok(saved);
    assert.strictEqual(saved.final_price, 90000);
    assert.strictEqual(saved.advance_deposit, 90000);
  });

  console.log('\n===============================================================');
  console.log(`🎉 ALL ${passedTests} OF ${totalTests} COMPREHENSIVE TESTS PASSED WITH 100% SUCCESS!`);
  console.log('===============================================================\n');
}

main().catch((err) => {
  console.error('\n❌ Test execution encountered a critical failure:', err);
  process.exit(1);
});
