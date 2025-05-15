
/**
 * Puter Authentication Service
 * Handles authentication with the Puter API
 */
export class PuterAuthService {
  constructor() {
    this.isInitialized = false;
    this.initializePromise = null;
    this.user = null;
    this.initialize();
  }

  /**
   * Initialize the Puter API
   */
  initialize() {
    if (this.initializePromise) {
      return this.initializePromise;
    }
    
    this.initializePromise = new Promise((resolve, reject) => {
      if (typeof window.puter !== 'undefined') {
        this.isInitialized = true;
        this.checkAuthStatus();
        resolve(true);
      } else {
        const puterScript = document.createElement('script');
        puterScript.src = "https://js.puter.com/v2/";
        puterScript.onload = () => {
          console.log("Puter.js loaded");
          this.isInitialized = true;
          this.checkAuthStatus();
          resolve(true);
        };
        puterScript.onerror = (error) => {
          console.error("Failed to load Puter.js:", error);
          reject(error);
        };
        document.head.appendChild(puterScript);
      }
    });
    
    return this.initializePromise;
  }

  /**
   * Check if user is already signed in
   */
  async checkAuthStatus() {
    await this.ensureInitialized();
    
    if (window.puter && window.puter.auth.isSignedIn()) {
      try {
        this.user = await window.puter.auth.getUser();
        return this.user;
      } catch (error) {
        console.error("Error getting user data:", error);
        return null;
      }
    }
    return null;
  }

  /**
   * Ensure Puter API is initialized
   */
  async ensureInitialized() {
    if (!this.isInitialized) {
      await this.initialize();
    }
    return this.isInitialized;
  }

  /**
   * Sign in with Puter
   */
  async signIn() {
    await this.ensureInitialized();
    
    try {
      await window.puter.auth.signIn();
      this.user = await window.puter.auth.getUser();
      return this.user;
    } catch (error) {
      console.error("Failed to sign in with Puter:", error);
      throw error;
    }
  }

  /**
   * Sign out from Puter
   */
  async signOut() {
    await this.ensureInitialized();
    
    try {
      window.puter.auth.signOut();
      this.user = null;
      return true;
    } catch (error) {
      console.error("Failed to sign out from Puter:", error);
      throw error;
    }
  }

  /**
   * Check if user is signed in
   */
  async isSignedIn() {
    await this.ensureInitialized();
    return window.puter && window.puter.auth.isSignedIn();
  }

  /**
   * Get current user
   */
  async getUser() {
    if (this.user) {
      return this.user;
    }
    
    return this.checkAuthStatus();
  }
}

export default PuterAuthService;
