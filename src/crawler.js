
/**
 * @typedef {Object} ProfileData
 * @property {string?=} admno
 * @property {string?=} name
 * @property {string?=} email
 * @property {string?=} batch
 * @property {string?=} phone
 * @property {string?=} image
 */


const DEFAULT_TIMEOUT = 10000;

/**
 * @typedef {Object} StatusCodes
 * @property {number} SUCCESS
 * @property {number} NETWORK_ERROR
 * @property {number} INVALID_CREDENTIALS
 * @property {number} API_ERROR
 * @property {number} ERROR_FETCHING_DATA
 * @property {number} TIMEOUT_ERROR
 */
const STATUS_CODES = {
  SUCCESS: 0,
  NETWORK_ERROR: 1,
  INVALID_CREDENTIALS: 2,
  API_ERROR: 3,
  ERROR_FETCHING_DATA: 4,
  TIMEOUT_ERROR: 5,
};

class EtLabScraper {
  constructor() {
    this.baseUrl = 'https://sctce.etlab.in';
    this.timeout = DEFAULT_TIMEOUT;
  }

  async makeRequest(url, options = {}) {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), this.timeout);
    
    try {
      const response = await fetch(url, {
        ...options,
        signal: controller.signal,
        headers: {
          'Content-Type': 'application/json',
          ...options.headers,
        },
      });
      
      clearTimeout(timeoutId);
      return response;
    } catch (error) {
      clearTimeout(timeoutId);
      if (error.name === 'AbortError') {
        throw new Error('Request timeout');
      }
      throw error;
    }
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

    try {
      const loginResponse = await this.makeRequest(`${this.baseUrl}/androidapp/app/login`, {
        method: 'POST',
        body: JSON.stringify({
          username: username,
          password: password,
        }),
      });

      if (!loginResponse.ok) {
        return { status: STATUS_CODES.NETWORK_ERROR };
      }

      const loginData = await loginResponse.json();

      if (!loginData.login) {
        return { status: STATUS_CODES.INVALID_CREDENTIALS };
      }

      const detailsResponse = await this.makeRequest(`${this.baseUrl}/androidapp/app/getstudentdetails`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${loginData.access_token}`,
        }
      });

      if (!detailsResponse.ok) {
        return { status: STATUS_CODES.API_ERROR };
      }

      const detailsData = await detailsResponse.json();

      if (!detailsData.login) {
        return { status: STATUS_CODES.ERROR_FETCHING_DATA };
      }

      const profileData = {
        admno: detailsData.admission_no || loginData.uname || null,
        name: detailsData.name || loginData.profile_name || null,
        email: detailsData.email || null,
        batch: loginData.course ?? loginData.academic_year ?? `${loginData.end_year}`,
        reg_no: detailsData.register_no || null,
        phone: detailsData.phone_home || detailsData.phone_father || detailsData.phone_mother || null,
        image: loginData.url || null,
      };

      return { data: profileData, status: STATUS_CODES.SUCCESS };
    } catch (error) {
      console.error('API request error:', error);
      if (error.message === 'Request timeout') {
        return { status: STATUS_CODES.TIMEOUT_ERROR };
      }
      return { status: STATUS_CODES.NETWORK_ERROR };
    }
  }

  async close() {
    // No cleanup needed for fetch-based implementation
  }
}

module.exports = { EtLabScraper, STATUS_CODES };
