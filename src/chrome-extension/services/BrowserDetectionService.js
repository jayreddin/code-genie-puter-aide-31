
/**
 * Browser Detection Service
 * Detects browser information and provides utility methods
 */
export class BrowserDetectionService {
  constructor() {
    this.detectBrowser();
  }

  /**
   * Detect browser name and version
   */
  detectBrowser() {
    const userAgent = navigator.userAgent;
    let browserName = "Unknown";
    let browserVersion = "";
    
    // Chrome
    if (userAgent.indexOf("Chrome") > -1 && userAgent.indexOf("Edg") === -1 && userAgent.indexOf("OPR") === -1) {
      browserName = "Chrome";
      browserVersion = userAgent.match(/Chrome\/([0-9.]+)/)?.[1] || "";
    }
    // Firefox
    else if (userAgent.indexOf("Firefox") > -1) {
      browserName = "Firefox";
      browserVersion = userAgent.match(/Firefox\/([0-9.]+)/)?.[1] || "";
    }
    // Edge
    else if (userAgent.indexOf("Edg") > -1) {
      browserName = "Edge";
      browserVersion = userAgent.match(/Edg\/([0-9.]+)/)?.[1] || "";
    }
    // Safari
    else if (userAgent.indexOf("Safari") > -1 && userAgent.indexOf("Chrome") === -1) {
      browserName = "Safari";
      browserVersion = userAgent.match(/Safari\/([0-9.]+)/)?.[1] || "";
    }
    // Opera
    else if (userAgent.indexOf("OPR") > -1) {
      browserName = "Opera";
      browserVersion = userAgent.match(/OPR\/([0-9.]+)/)?.[1] || "";
    }
    
    this.browserInfo = {
      name: browserName,
      version: browserVersion
    };
  }

  /**
   * Get browser information
   */
  getBrowserInfo() {
    return this.browserInfo;
  }

  /**
   * Add browser info to an element as text
   * @param {HTMLElement} element - The element to add browser info to
   */
  addBrowserInfoToElement(element) {
    if (!element) return;
    
    const { name, version } = this.browserInfo;
    element.textContent = `Browser: ${name} ${version}`;
    return element;
  }

  /**
   * Create and return a browser info element
   * @param {string} className - CSS class to add to the element
   * @returns {HTMLElement} - The created element with browser info
   */
  createBrowserInfoElement(className = '') {
    const { name, version } = this.browserInfo;
    const element = document.createElement('div');
    element.textContent = `Browser: ${name} ${version}`;
    if (className) {
      element.className = className;
    }
    return element;
  }
}

export default BrowserDetectionService;
