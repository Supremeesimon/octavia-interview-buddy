import { getTimeBasedGreeting, getGreetingWithName } from '../greeting.utils';

describe('Greeting Utilities', () => {
  beforeAll(() => {
    // Mock the Date object to control the time for testing
    jest.useFakeTimers();
  });

  afterAll(() => {
    // Restore the original Date object
    jest.useRealTimers();
  });

  describe('getTimeBasedGreeting', () => {
    test('returns "Good Morning" for hours 0-11', () => {
      // Set time to 9:00 AM
      jest.setSystemTime(new Date(2023, 5, 15, 9, 0, 0));
      expect(getTimeBasedGreeting()).toBe('Good Morning');
    });

    test('returns "Good Afternoon" for hours 12-17', () => {
      // Set time to 2:00 PM
      jest.setSystemTime(new Date(2023, 5, 15, 14, 0, 0));
      expect(getTimeBasedGreeting()).toBe('Good Afternoon');
    });

    test('returns "Good Evening" for hours 18-23', () => {
      // Set time to 7:00 PM
      jest.setSystemTime(new Date(2023, 5, 15, 19, 0, 0));
      expect(getTimeBasedGreeting()).toBe('Good Evening');
    });
  });

  describe('getGreetingWithName', () => {
    test('returns correct greeting with name in the morning', () => {
      // Set time to 9:00 AM
      jest.setSystemTime(new Date(2023, 5, 15, 9, 0, 0));
      expect(getGreetingWithName('John')).toBe('Good Morning, John!');
    });

    test('returns correct greeting with name in the afternoon', () => {
      // Set time to 2:00 PM
      jest.setSystemTime(new Date(2023, 5, 15, 14, 0, 0));
      expect(getGreetingWithName('Jane')).toBe('Good Afternoon, Jane!');
    });

    test('returns correct greeting with name in the evening', () => {
      // Set time to 7:00 PM
      jest.setSystemTime(new Date(2023, 5, 15, 19, 0, 0));
      expect(getGreetingWithName('Bob')).toBe('Good Evening, Bob!');
    });
  });
});