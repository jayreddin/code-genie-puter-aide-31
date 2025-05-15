
/**
 * Status Message Service
 * Manages status messages in the UI
 */
export class StatusMessageService {
  /**
   * Constructor
   * @param {HTMLElement} statusElement - The element to show messages in
   */
  constructor(statusElement) {
    this.statusElement = statusElement;
    this.timeout = null;
  }

  /**
   * Show a status message
   * @param {string} message - The message to display
   * @param {string} type - The type of message ('success', 'error', 'warning', or 'info')
   * @param {number} duration - How long to show the message in milliseconds (default: 5000)
   */
  show(message, type, duration = 5000) {
    if (!this.statusElement) return;
    
    // Clear any existing timeout
    if (this.timeout) {
      clearTimeout(this.timeout);
    }
    
    // Set the message text
    this.statusElement.textContent = message;
    
    // Remove all existing classes
    this.statusElement.className = '';
    
    // Add the appropriate class
    this.statusElement.classList.add(type || 'info');
    
    // Set a timeout to clear the message
    this.timeout = setTimeout(() => {
      this.clear();
    }, duration);
    
    return this;
  }

  /**
   * Show a success message
   * @param {string} message - The message to display
   * @param {number} duration - How long to show the message in milliseconds
   */
  success(message, duration) {
    return this.show(message, 'success', duration);
  }

  /**
   * Show an error message
   * @param {string} message - The message to display
   * @param {number} duration - How long to show the message in milliseconds
   */
  error(message, duration) {
    return this.show(message, 'error', duration);
  }

  /**
   * Show a warning message
   * @param {string} message - The message to display
   * @param {number} duration - How long to show the message in milliseconds
   */
  warning(message, duration) {
    return this.show(message, 'warning', duration);
  }

  /**
   * Show an info message
   * @param {string} message - The message to display
   * @param {number} duration - How long to show the message in milliseconds
   */
  info(message, duration) {
    return this.show(message, 'info', duration);
  }

  /**
   * Clear the status message
   */
  clear() {
    if (!this.statusElement) return;
    
    this.statusElement.textContent = '';
    this.statusElement.className = '';
    
    if (this.timeout) {
      clearTimeout(this.timeout);
      this.timeout = null;
    }
    
    return this;
  }

  /**
   * Set the status element
   * @param {HTMLElement} element - The element to use for status messages
   */
  setElement(element) {
    this.statusElement = element;
    return this;
  }
}

export default StatusMessageService;
