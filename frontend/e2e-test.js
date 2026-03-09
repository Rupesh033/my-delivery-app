const { chromium } = require('playwright');

(async () => {
    console.log('Starting Playwright test...');
    const browser = await chromium.launch({ headless: true });

    // 1. Rider Tab
    const context1 = await browser.newContext();
    const riderPage = await context1.newPage();
    console.log('Rider navigating to /rider...');
    await riderPage.goto('https://frontend-taupe-eta-66.vercel.app/rider');

    console.log('Rider waiting for ONLINE button...');
    await riderPage.waitForSelector('text="OFFLINE"', { timeout: 10000 });
    console.log('Rider clicking ONLINE...');
    await riderPage.click('text="OFFLINE"');
    await riderPage.waitForSelector('text="ONLINE"');
    console.log('Rider is ONLINE.');
    await riderPage.screenshot({ path: 'rider_online.png' });

    // 2. Customer Tab
    const context2 = await browser.newContext();
    const customerPage = await context2.newPage();
    console.log('Customer navigating to /customer...');
    await customerPage.goto('https://frontend-taupe-eta-66.vercel.app/customer');

    console.log('Customer booking ride...');
    await customerPage.fill('input[placeholder="Search pickup location"]', 'Garhwa Bus Stand');
    await customerPage.fill('input[placeholder="Search drop location"]', 'Rehla Square');
    await customerPage.click('text="Book Now"');

    // 3. Verify Rider gets request
    console.log('Waiting for Rider to get New Ride Request...');
    try {
        await riderPage.waitForSelector('text="New Ride Request"', { timeout: 15000 });
        console.log('SUCCESS! Rider got the request.');
        await riderPage.screenshot({ path: 'rider_request.png' });

        await riderPage.click('text="Accept"');
        console.log('Rider Accepted the request.');

        // 4. Verify Customer gets OTP
        console.log('Waiting for Customer to get OTP screen...');
        await customerPage.waitForSelector('text="Rider Assigned"', { timeout: 10000 });
        await customerPage.screenshot({ path: 'customer_otp.png' });
        console.log('SUCCESS! Customer got OTP response.');
    } catch (e) {
        console.error('FAILED to sync ride. Rider did not get request.', e);
        await riderPage.screenshot({ path: 'rider_failed.png' });
        await customerPage.screenshot({ path: 'customer_failed.png' });
    }

    await browser.close();
    console.log('Test complete.');
})();
