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

      await page.goto(`${this.baseUrl}/user/login`, { timeout: 5000 }).catch(() => {});

      await page.type('#LoginForm_username', username);
      await page.type('#LoginForm_password', password);

      await Promise.all([
        page.click('.btn-success').catch(() => {}),
        page.waitForNavigation({ waitUntil: 'networkidle0', timeout: 4000 }).catch(() => {}),
      ]);

      await page.goto(`${this.baseUrl}/student/profile`, { timeout: 3000 }).catch(() => {});

      if (page.url().includes('/user/login')) {
        page.close();
        return null;
      }

      //

      // Extract data
      const profileData = await page.evaluate(() => {
        const data = {
          admno: null,

          name: document.querySelector('#user-nav .text')?.textContent?.trim(),

          email: null,

          batch: document.body.innerHTML.match(/Studying in <a[^>]+>([^<]+)<\/a>/)?.[1]?.trim(),

          phone: null,

          image: document.querySelector('#photo')?.src,
        };

        const tables = document.querySelectorAll('table.detail-view');
        tables.forEach((table) => {
          const rows = table.querySelectorAll('tr');
          rows.forEach((row) => {
            const th = row.querySelector('th');
            const td = row.querySelector('td');

            if (th && td) {
              const key = th.textContent.trim().toLowerCase();
              const value = td.textContent.trim();

              if (key.includes('admission no')) {
                data.admno = value;
              } else if (key === 'email' && !key.includes('college')) {
                data.email = value;
              } else if (key === 'mobile no') {
                data.phone = value;
              }
            }
          });
        });

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
