/**
 * Tests CORS configuration by sending a test request to the API
 * @param {string} endpoint - API endpoint to test
 * @returns {Promise<Object>} - Test results
 */
export const testCORSConfiguration = async (endpoint = 'api/user') => {
    const results = {
      success: false,
      error: null,
      details: {}
    };
    
    try {
      // Test a simple GET request first
      console.log('Testing CORS with GET request...');
      const getResponse = await fetch(`http://127.0.0.1:8000/${endpoint}`, {
        method: 'GET',
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json'
        },
        credentials: 'include'
      });
      
      results.details.getStatus = getResponse.status;
      results.details.getOk = getResponse.ok;
      results.details.getHeaders = {};
      
      // Log headers from the response
      getResponse.headers.forEach((value, key) => {
        results.details.getHeaders[key] = value;
      });
      
      // Test an OPTIONS request (preflight)
      console.log('Testing CORS preflight with OPTIONS request...');
      const optionsResponse = await fetch(`http://127.0.0.1:8000/${endpoint}`, {
        method: 'OPTIONS',
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json',
          'X-CSRF-TOKEN': 'test-token',
          'X-XSRF-TOKEN': 'test-token',
          'Authorization': 'Bearer test-token'
        },
        credentials: 'include'
      });
      
      results.details.optionsStatus = optionsResponse.status;
      results.details.optionsOk = optionsResponse.ok;
      results.details.optionsHeaders = {};
      
      // Log headers from the preflight response
      optionsResponse.headers.forEach((value, key) => {
        results.details.optionsHeaders[key] = value;
      });
      
      // Check for CORS-specific headers
      const corsHeaders = [
        'access-control-allow-origin',
        'access-control-allow-methods',
        'access-control-allow-headers',
        'access-control-allow-credentials',
        'access-control-expose-headers'
      ];
      
      results.details.corsHeadersPresent = corsHeaders.every(header => 
        optionsResponse.headers.has(header)
      );
      
      results.success = true;
    } catch (error) {
      results.success = false;
      results.error = {
        message: error.message,
        name: error.name,
        stack: error.stack
      };
    }
    
    return results;
  };
  
  /**
   * Logs details about the browser's security context
   */
  export const logSecurityContext = () => {
    console.log('Cross-Origin Isolation Status:', window.crossOriginIsolated);
    console.log('Document Origin:', window.location.origin);
    console.log('Secure Context:', window.isSecureContext);
    
    // Check local storage
    try {
      localStorage.setItem('test', 'test');
      localStorage.removeItem('test');
      console.log('Local Storage: Available');
    } catch (e) {
      console.log('Local Storage: Not Available -', e.message);
    }
    
    // Check cookies
    try {
      document.cookie = 'test=test; SameSite=Strict; Secure';
      console.log('Cookies: Available');
    } catch (e) {
      console.log('Cookies: Not Available -', e.message);
    }
  };
  
  export default {
    testCORSConfiguration,
    logSecurityContext
  };