import { getTimeBasedGreeting, getGreetingWithName } from '../utils/greeting.utils';

// Test the greeting utilities
console.log('Testing greeting utilities:');

// Test getGreetingWithName with different names
console.log('Greetings with names:');
console.log('- Default time:', getGreetingWithName('John'));
console.log('- Default time:', getGreetingWithName('Jane'));
console.log('- Default time:', getGreetingWithName('Bob'));

console.log('\nAll tests completed successfully!');