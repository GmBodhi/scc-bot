const puppeteer = require('puppeteer');

/**
 * @typedef {Object} ProfileData
 * @property {string?=} admno
 * @property {string?=} name
 * @property {string?=} email
 * @property {string?=} batch
 * @property {string?=} phone
 * @property {string?=} image
 */

/**
 * @typedef {Object} PageNavigationOptions
 * @property {number} loginTimeout
 * @property {number} navigationTimeout
 * @property {number} profileTimeout
 */

/**
 * @type {PageNavigationOptions}
 */
const DEFAULT_TIMEOUTS = {
  loginTimeout: 10000,
  navigationTimeout: 8000,
  profileTimeout: 6000,
};

/**
 * @typedef {Object} StatusCodes
 * @property {number} SUCCESS
 * @property {number} PAGE_NOT_LOADED
 * @property {number} INVALID_CREDENTIALS
 * @property {number} ERROR_CREATING_PAGE
 * @property {number} ERROR_FETCHING_DATA
 * @property {number} ERROR_CLOSING_BROWSER
 * @property {number} ERROR_LAUNCHING_BROWSER
 */
const STATUS_CODES = {
  SUCCESS: 0,
  PAGE_NOT_LOADED: 1,
  INVALID_CREDENTIALS: 2,
  ERROR_CREATING_PAGE: 3,
};

class EtLabScraper {
  constructor() {
    /**
     * @type {puppeteer.Browser | null}
     */
    this.browser = null;

    this.baseUrl = 'https://sctce.etlab.in';

    /** @type {PageNavigationOptions}  */
    this.timeouts = { ...DEFAULT_TIMEOUTS };
  }

  async init() {
    if (this.browser?.connected) return;

    this.browser = await puppeteer
      .launch({
        headless: true,
        args: ['--no-sandbox', '--disable-setuid-sandbox'],
      })
      .catch((error) => {
        console.error('Browser launch error:', error);
        throw new Error('Failed to launch browser');
      });

    console.log('pptr: Browser launched');
  }

  /**
   * @param {string} username
   * @param {string} password
   * @returns {Promise<{status: number, data?: ProfileData}>}
   */
  async getData(username, password) {
    if (!username || !password) {
      throw new Error('Username and password are required');
    }

    await this.init();

    const page = await this.browser.newPage().catch(() => null);

    if (!page) {
      return { status: STATUS_CODES.ERROR_CREATING_PAGE };
    }

    try {
      await page.goto(`${this.baseUrl}/user/login`, {
        timeout: this.timeouts.loginTimeout,
      });

      await page.type('#LoginForm_username', username);
      await page.type('#LoginForm_password', password);

      await Promise.all([
        page.click('.btn-success'),
        page
          .waitForNavigation({
            waitUntil: 'networkidle0',
            timeout: this.timeouts.navigationTimeout,
          })
          .catch(() => {}),
      ]);

      await page.goto(`${this.baseUrl}/student/profile`, {
        timeout: this.timeouts.profileTimeout,
      });
    } catch (error) {
      console.error('Error typing credentials:', error);
      await page.close();
      return { status: STATUS_CODES.PAGE_NOT_LOADED };
    }

    if (page.url().includes('/user/login')) {
      await page.close();
      return { status: STATUS_CODES.INVALID_CREDENTIALS };
    }

    const profileData = await page.evaluate(() => {
      /* eslint-disable no-undef */
      try {
        /**
         * @type {ProfileData}
         */
        const data = {
          admno: null,
          name: document.querySelector('#user-nav .text')?.textContent?.trim() || null,
          email: null,
          batch: document.body.innerHTML.match(/Studying in <a[^>]+>([^<]+)<\/a>/)?.[1]?.trim() || null,
          phone: null,
          image: document.querySelector('#photo')?.src || null,
        };

        const tables = document.querySelectorAll('table.detail-view');
        if (tables) {
          tables.forEach((table) => {
            const rows = table.querySelectorAll('tr');
            if (rows) {
              rows.forEach((row) => {
                const th = row.querySelector('th');
                const td = row.querySelector('td');

                if (th && td) {
                  const key = th.textContent?.trim().toLowerCase();
                  const value = td.textContent?.trim();

                  if (key?.includes('admission no')) {
                    data.admno = value;
                  } else if (key === 'email' && !key.includes('college')) {
                    data.email = value;
                  } else if (key === 'mobile no') {
                    data.phone = value;
                  }
                }
              });
            }
          });
        }

        return data;
      } catch (error) {
        console.error('Page evaluation error:', error);
        return null;
      }
      /* eslint-enable no-undef */
    });

    if (!profileData) {
      await page.close();
      return { status: STATUS_CODES.ERROR_FETCHING_DATA };
    }

    await page.close();
    return { data: profileData, status: STATUS_CODES.SUCCESS };
  }

  async close() {
    if (this.browser) {
      await this.browser.close().catch(console.error);
      this.browser = null;
    }
  }
}

module.exports = { EtLabScraper, STATUS_CODES };
