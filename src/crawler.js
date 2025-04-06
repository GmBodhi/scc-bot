const puppeteer = require('puppeteer');

class EtLabScraper {
  constructor() {
    /**
     * @type {puppeteer.Browser | null}
     */
    this.browser = null;
    this.baseUrl = 'https://sctce.etlab.in';
  }

  async init() {
    this.browser = await puppeteer.launch({
      headless: true,
      args: ['--no-sandbox', '--disable-setuid-sandbox'],
    });

    console.log('pptr: Browser launched');
  }

  /**
   * Get student profile data from etlab
   * @param {string} username - The username to login with
   * @param {string} password - The password to login with
   * @returns {Promise<ProfileData|null>} The student profile data or null if login failed
   */
  async getData(username, password) {
    try {
      if (!this.browser?.connected) await this.init();

      const page = await this.browser.newPage();

      // Navigate to login page
      await page.goto(`${this.baseUrl}/user/login`, { timeout: 3000 }).catch(() => {});

      // Login
      await page.type('#LoginForm_username', username);
      await page.type('#LoginForm_password', password);

      // Submit and wait for navigation
      await Promise.all([
        page.click('.btn-success').catch(() => {}),
        page.waitForNavigation({ waitUntil: 'networkidle0', timeout: 4000 }).catch(() => {}),
      ]);

      // profile page
      await page.goto(`${this.baseUrl}/student/profile`, { timeout: 3000 }).catch(() => {});

      if (page.url().includes('/user/login')) {
        page.close();
        return null;
      }

      //

      // Extract data
      const profileData = await page.evaluate(() => {
        /* global document */
        const data = {
          admno: document.querySelector('#yw13 > tbody > tr:nth-child(1) > td')?.innerText,

          name: document.querySelector('#yw12 > tbody > tr:nth-child(1) > td')?.innerText,

          email: document.querySelector('#yw19 > tbody > tr:nth-child(1) > td')?.innerText,

          batch: document.querySelector(
            '#content > div.container-fluid > div:nth-child(3) > div > div > div.widget-content > div > div > center > span > a'
          )?.innerText,

          phone: document.querySelector('#yw19 > tbody > tr.even > td')?.innerText,

          image: document.querySelector('#photo')?.src,
        };
        return data;
      });

      page.close();
      return profileData;
    } catch (error) {
      console.error('Error fetching data:', error);
      throw new Error('Failed to fetch profile data');
    }
  }

  async close() {
    if (this.browser) {
      await this.browser.close();
      this.browser = null;
    }
  }
}

module.exports = { EtLabScraper };

/**
 * Interface representing user profile data from etlab
 */
/**
 * @typedef {Object} ProfileData
 * @property {string|undefined} admno - Student admission number
 * @property {string|undefined} name - Student name
 * @property {string|undefined} email - Student email
 * @property {string|undefined} batch - Student batch
 * @property {string|undefined} phone - Student phone number
 * @property {string|undefined} image - URL of student photo
 */
