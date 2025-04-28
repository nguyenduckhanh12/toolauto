const puppeteer = require('puppeteer');
const fs = require('fs');
const path = require('path');

// Giả sử file JSON accounts ở ./accounts.json
const accounts = require('./acc_list.json');

const logs = [];

async function login(account, index) {
    const browser = await puppeteer.launch({ headless: false, defaultViewport: null, args: ['--no-sandbox'] });
    const page = await browser.newPage();
    try {
        console.log(`[${index}] Start login: ${account.email}`);

        // Set User-Agent giả giống Chrome
        await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36');

        await page.goto('https://chienbinhidle.vn/game/dang-nhap', { waitUntil: 'networkidle2' });

        // Đợi input username xuất hiện
        await page.waitForSelector('input[name="username"][tabindex="0"]');

        // Gõ username và password
        await page.type('input[name="username"][tabindex="0"]', account.email, { delay: 100 });
        await page.type('input[name="password"][tabindex="0"]', account.password, { delay: 100 });

        // Đợi nút "Đăng Nhập" rồi click
        const [loginButton] = await page.$x('//button[contains(text(), "Đăng Nhập")]');
        if (loginButton) {
            await loginButton.click();
            console.log('Login clicked');
        } else {
            console.log('Button login not found');
            await browser.close();
            return;
        }

        console.log(`[${index}] Waiting for login...`);
        await page.waitForNavigation();
        // Chờ trang iframe load
        await page.waitForSelector('iframe#game-frame');
        console.log(`[${index}] Frame load completed`)
        await page.waitForTimeout(8000);  // Chờ 5s để trang tải xong

        const iframe = page.frames()[1];
        const canvas = await iframe.$('canvas');
        const boundingBox = await canvas.boundingBox();
        if (boundingBox) {
            // 1. Click nút "Chơi Ngay" (chọn server)
            const xServer = boundingBox.x + boundingBox.width / 2;
            const yServer = boundingBox.y + boundingBox.height * 0.85;
            console.log(`[${index}] Choose server in x: ${xServer}, y: ${yServer}`);
            await page.mouse.click(xServer, yServer, { delay: 100 });
            console.log(`[${index}] Choose server completed`);
        
            // Chờ game load xong
            await page.waitForTimeout(5000);
        
            // 2. Click nút "X" để đóng popup Goku
            const xClose = boundingBox.x + boundingBox.width * 0.89;
            const yClose = boundingBox.y + boundingBox.height * 0.1;
            console.log(`[${index}] Close popup X at x: ${xClose}, y: ${yClose}`);
            await page.mouse.click(xClose, yClose, { delay: 100 });
            console.log(`[${index}] Popup closed`);
        
            // Chờ thêm tí cho màn chính load đầy đủ
            await page.waitForTimeout(2000);
        
            // 3. Click nút "Tăng Tốc"
            const xBoost = boundingBox.x + boundingBox.width * 0.89;
            const yBoost = boundingBox.y + boundingBox.height * 0.7;
            console.log(`[${index}] Click boost at x: ${xBoost}, y: ${yBoost}`);
            await page.mouse.click(xBoost, yBoost, { delay: 100 });
            console.log(`[${index}] Boost clicked`);
            await page.waitForTimeout(1000);
        }

        logs.push({ email: account.email, status: 'Success' });
    } catch (err) {
        console.log(`[${index}] Error: ${err.message}`);
        logs.push({ email: account.email, status: 'Fail', error: err.message });
    } finally {
        await browser.close();
    }
}

// Chạy đồng thời 5 tabs 1 lúc
async function startAll(win) {
    const concurrency = 1;
    let index = 0;

    while (index < accounts.length) {
        const batch = accounts.slice(index, index + concurrency);
        await Promise.all(batch.map((account, i) => login(account, index + i + 1)));
        index += concurrency;
    }

    console.log('All account completed!');
    if (win) win.webContents.send('all-done');
}

// Xuất file log CSV
function exportCSV() {
    const csvContent =
        'Email,Status,Error\n' + logs.map((log) => `${log.email},${log.status},${log.error || ''}`).join('\n');

    const exportPath = path.join(__dirname, 'log.csv');
    fs.writeFileSync(exportPath, csvContent);

    console.log('Log exported:', exportPath);
}

module.exports = { startAll, exportCSV };
