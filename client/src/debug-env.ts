// Debug environment variables
console.log('=== ENVIRONMENT VARIABLES DEBUG ===');
console.log('import.meta.env:', import.meta.env);
console.log('VITE_API_URL:', import.meta.env.VITE_API_URL);
console.log('typeof VITE_API_URL:', typeof import.meta.env.VITE_API_URL);
console.log('VITE_API_URL === undefined:', import.meta.env.VITE_API_URL === undefined);
console.log('VITE_API_URL === null:', import.meta.env.VITE_API_URL === null);
console.log('VITE_API_URL === ""', import.meta.env.VITE_API_URL === "");

// Test URL construction
const testUrl = import.meta.env.VITE_API_URL + '/api/login';
console.log('Test URL construction:', testUrl);
console.log('Test URL includes "undefined":', testUrl.includes('undefined'));

// Test fetch directly
console.log('=== TESTING FETCH ===');
const originalFetch = window.fetch;
console.log('Original fetch:', originalFetch);

// Check if fetch has been overridden
if (window.fetch !== originalFetch) {
  console.log('Fetch has been overridden!');
} else {
  console.log('Fetch is original');
}

export {};


