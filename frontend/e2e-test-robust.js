const { chromium } = require('playwright');

(async () => {
    console.log('🚀 Starting Final Successful Verification...');
    const browser = await chromium.launch({ headless: true });

    try {
        // 1. Setup Rider
        const riderContext = await browser.newContext();
        const riderPage = await riderContext.newPage();
        riderPage.on('console', msg => console.log(`[RIDER-BROWSER] ${msg.text()}`));
        console.log('--- Rider: Navigating to Hub ---');
        await riderPage.goto('http://localhost:3000/rider', { waitUntil: 'networkidle' });

        console.log('--- Rider: Going ONLINE ---');
        const offlineBtn = riderPage.locator('button:has-text("OFFLINE")');
        const goOnlineBtn = riderPage.locator('button:has-text("Go Online")');
        
        if (await goOnlineBtn.isVisible()) {
            await goOnlineBtn.click();
        } else if (await offlineBtn.isVisible()) {
            await offlineBtn.click();
        }

        // Wait for either the waiting status OR the new request card
        const waitingSelector = 'text="Waiting for requests..."';
        const requestSelector = 'text=/New Request/i';
        
        const state = await Promise.race([
            riderPage.waitForSelector(waitingSelector, { timeout: 15000 }).then(() => 'waiting'),
            riderPage.waitForSelector(requestSelector, { timeout: 15000 }).then(() => 'request')
        ]);

        console.log(`✅ Rider is in state: ${state}`);
        await riderPage.screenshot({ path: 'test_rider_ready.png' });

        // 2. Setup Customer
        const customerContext = await browser.newContext();
        const customerPage = await customerContext.newPage();
        customerPage.on('console', msg => console.log(`[CUSTOMER-BROWSER] ${msg.text()}`));
        console.log('--- Customer: Navigating to App ---');
        await customerPage.goto('http://localhost:3000/customer', { waitUntil: 'networkidle' });

        console.log('--- Customer: Booking Ride ---');
        await customerPage.fill('input[placeholder*="Garhwa"]', 'Garhwa');
        await customerPage.fill('input[placeholder*="Rehla"]', 'Rehla');
        await customerPage.waitForSelector('text="Estimated Fare"', { timeout: 10000 });

        await customerPage.click('button:has-text("Book Now")');
        console.log('✅ Ride Booked, searching...');
        // Give some time for socket to broadcast
        await customerPage.waitForTimeout(2000);

        // 3. Sync Check: Rider receives request
        console.log('--- Sync: Checking Rider for request ---');
        await riderPage.waitForSelector('text=/New Request/i', { timeout: 30000 });
        console.log('✅ Rider received the request!');
        await riderPage.screenshot({ path: 'test_rider_received_final.png' });

        await riderPage.click('button:has-text("Accept")');
        console.log('--- Rider: Accepted Ride ---');

        // 4. Sync Check: Customer sees OTP
        console.log('--- Sync: Checking Customer for OTP ---');
        await customerPage.waitForSelector('text="OTP for your ride"', { timeout: 20000 });
        const otpText = await customerPage.locator('p.text-5xl').innerText();
        console.log(`✅ Customer received OTP: ${otpText}`);
        await customerPage.screenshot({ path: 'test_customer_booked_final.png' });

        // 5. Start Ride
        console.log('--- Rider: Verifying OTP ---');
        const cleanOtp = otpText.replace(/\s/g, '');
        await riderPage.fill('input[placeholder="----"]', cleanOtp);
        await riderPage.click('button:has-text("Start Ride")');

        await riderPage.waitForSelector('text="Ride in Progress"', { timeout: 15000 });
        console.log('✅ ALL SYSTEMS WORKING! SUCCESS!');
        await riderPage.screenshot({ path: 'test_ride_started_final.png' });

        console.log('\n🌟 FINAL VERIFICATION COMPLETE 🌟');

    } catch (err) {
        console.error('\n❌ TEST FAILED:', err.message);
        const pages = browser.contexts().flatMap(c => c.pages());
        for (let i = 0; i < pages.length; i++) {
            await pages[i].screenshot({ path: `final_error_${i}.png` });
        }
    } finally {
        await browser.close();
    }
})();
