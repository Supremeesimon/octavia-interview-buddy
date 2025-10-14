/**
 * Generates a time-based greeting message
 * @returns A greeting string like "Good Morning", "Good Afternoon", or "Good Evening"
 */
export function getTimeBasedGreeting(): string {
  const currentHour = new Date().getHours();
  
  if (currentHour < 12) {
    return "Good Morning";
  } else if (currentHour < 18) {
    return "Good Afternoon";
  } else {
    return "Good Evening";
  }
}

/**
 * Generates a complete greeting message with the user's name
 * @param name The user's name
 * @returns A complete greeting message like "Good Morning, John!"
 */
export function getGreetingWithName(name: string): string {
  // Add debugging
  console.log('getGreetingWithName called with name:', name);
  
  // Handle case where name might be undefined or empty
  if (!name) {
    return `${getTimeBasedGreeting()}!`;
  }
  
  const greeting = getTimeBasedGreeting();
  const result = `${greeting}, ${name}!`;
  console.log('getGreetingWithName result:', result);
  return result;
}