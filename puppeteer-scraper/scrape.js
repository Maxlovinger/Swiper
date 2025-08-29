const { execSync } = require('child_process');

// Force download of the browser
try {
  console.log('Ensuring browser is installed...');
  execSync('node node_modules/puppeteer/install.mjs', { stdio: 'inherit' });
  console.log('Browser installation confirmed.');
} catch (error) {
  console.error('Failed to install browser:', error);
  process.exit(1);
}

const puppeteer = require('puppeteer');

(async () => {
  const browser = await puppeteer.launch({ headless: false }); // Keep headless: false so you can log in
  const page = await browser.newPage();

  // Navigate to a Tinder profile URL
  // IMPORTANT: You will need to manually log in when the browser opens.
  await page.goto('https://tinder.com/app/recs', { waitUntil: 'networkidle2' });

  console.log('Please log in to Tinder in the browser window...');
  // Wait for navigation after login, or for the main content to appear
  await page.waitForSelector('main', { timeout: 300000 }); // 5 minutes to log in
  console.log('Logged in. Starting scrape...');

  // Give the page a moment to settle after login
  await new Promise(resolve => setTimeout(resolve, 5000));

  const BIO_SELECTORS = [
    '[data-testid="UserBio"]', // Best bet: test IDs are stable
    '.profileCard__bio', // Your original selector
    '.BreakWord', // A class that is sometimes used for bio-like text
    '.text-sm', // A generic class that might contain the bio
  ];

  let bio = null;

  for (const selector of BIO_SELECTORS) {
    try {
      console.log(`Trying selector: ${selector}`);
      await page.waitForSelector(selector, { timeout: 10000 }); // 10-second timeout for each selector
      const element = await page.$(selector);
      if (element) {
        bio = await page.evaluate(el => el.innerText, element);
        if (bio) {
          console.log(`Successfully scraped bio with selector: ${selector}`);
          break; // Exit loop if bio is found
        }
      }
    } catch (error) {
      console.log(`Selector ${selector} failed or not found.`);
    }
  }

  if (bio) {
    console.log('Scraped Bio:', bio);
  } else {
    console.error('Could not scrape bio. All selectors failed.');
  }

  await browser.close();
})();
