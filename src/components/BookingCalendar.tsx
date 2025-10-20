
import React, { useState } from 'react';
import { Calendar } from '@/components/ui/calendar';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { CheckCircle, Clock, Calendar as CalendarIcon, ArrowRight, AlertTriangle } from 'lucide-react';
import { format, addDays, isBefore, isToday, startOfDay, addHours, isSameDay } from 'date-fns';
import { toast } from "sonner";
import { useIsMobile } from '@/hooks/use-mobile';

interface BookingCalendarProps {
  onBookingComplete: (date: Date, time: string) => void;
  availableSessions?: number;
  // New props based on the error message
  allowedBookingsPerMonth?: number;
  usedBookings?: number;
  sessionLength?: number; // Session duration in minutes
}

const BookingCalendar = ({ 
  onBookingComplete, 
  availableSessions = 0,
  allowedBookingsPerMonth = 0,
  usedBookings = 0,
  sessionLength = 20 // Default to 20 minutes
}: BookingCalendarProps) => {
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(undefined);
  const [selectedTime, setSelectedTime] = useState<string | null>(null);
  const [isBooking, setIsBooking] = useState(false);
  const isMobile = useIsMobile();

  const today = startOfDay(new Date());
  const maxDate = addDays(today, 30); // Allow booking up to 30 days in advance
  
  // Generate fake available time slots for demo
  const getAvailableTimeSlots = (date: Date) => {
    if (!date) return [];
    
    // For demo - generate different time slots based on the day of week
    const dayOfWeek = date.getDay();
    const baseSlots = ['09:00 AM', '10:00 AM', '11:00 AM', '02:00 PM', '03:00 PM', '04:00 PM'];
    
    // Remove some slots to demonstrate availability variations
    const availableSlots = baseSlots.filter((_, index) => {
      // Different availability based on day of week (for demo purposes)
      if (dayOfWeek === 0 || dayOfWeek === 6) { // Weekend
        return index % 3 === 0; // Fewer slots on weekends
      } else if (dayOfWeek === 5) { // Friday
        return index % 2 === 0;
      } else {
        return true; // All slots available on other days
      }
    });
    
    return availableSlots;
  };
  
  const timeSlots = selectedDate ? getAvailableTimeSlots(selectedDate) : [];
  
  const handleDateSelect = (date: Date | undefined) => {
    setSelectedDate(date);
    setSelectedTime(null);
  };
  
  const handleTimeSelect = (time: string) => {
    setSelectedTime(time);
  };
  
  const handleBookInterview = () => {
    if (!selectedDate || !selectedTime) {
      toast.error("Please select both a date and time");
      return;
    }
    
    setIsBooking(true);
    
    // Simulate API call to book the interview
    setTimeout(() => {
      toast.success("Interview scheduled successfully!");
      onBookingComplete(selectedDate, selectedTime);
      setIsBooking(false);
    }, 1000);
  };
  
  const disabledDays = (date: Date) => {
    // Disable past dates, today, and dates more than 30 days in the future
    return isBefore(date, today) || 
           isBefore(maxDate, date) || 
           date.getDay() === 0; // Disable Sundays for demo
  };
  
  // Check if there are available sessions from the institution's pool
  const noAvailableSessions = availableSessions <= 0;
  
  // Check if the student has reached their booking limit (if applicable)
  const reachedBookingLimit = allowedBookingsPerMonth > 0 && usedBookings >= allowedBookingsPerMonth;
  
  // Determine the correct message to show when booking is not possible
  const getBookingLimitationMessage = () => {
    if (noAvailableSessions) {
      return {
        title: "No interview slots available",
        description: "Your institution has used all available interview sessions. Contact your institution administrator to request more sessions."
      };
    }
    
    if (reachedBookingLimit) {
      return {
        title: "Booking limit reached",
        description: `You've used all ${allowedBookingsPerMonth} of your allowed bookings this month. Please wait until next month or contact your institution administrator.`
      };
    }
    
    return null;
  };
  
  const bookingLimitationMessage = getBookingLimitationMessage();
  const canBook = !noAvailableSessions && !reachedBookingLimit;
  
  return (
    <Card tooltip="Schedule your interview with Octavia AI" className="w-full">
      <CardHeader>
        <CardTitle>Book Your Interview</CardTitle>
        <CardDescription>
          Select a date and time for your {sessionLength}-minute interview with Octavia AI
        </CardDescription>
        
        <div className="mt-2 flex items-center text-sm">
          <div className="text-muted-foreground">
            Available sessions: <span className="font-medium">{availableSessions}</span>
          </div>
          
          {allowedBookingsPerMonth > 0 && (
            <div className="ml-4 text-muted-foreground">
              Your bookings: <span className="font-medium">{usedBookings}/{allowedBookingsPerMonth}</span> this month
            </div>
          )}
        </div>
      </CardHeader>
      
      <CardContent className="space-y-4">
        {bookingLimitationMessage ? (
          <div className="rounded-md bg-destructive/10 p-4 text-center">
            <div className="flex justify-center mb-2">
              <AlertTriangle className="h-6 w-6 text-destructive" />
            </div>
            <p className="text-destructive font-medium">
              {bookingLimitationMessage.title}
            </p>
            <p className="text-sm text-muted-foreground mt-1">
              {bookingLimitationMessage.description}
            </p>
          </div>
        ) : (
          <>
            <div className="flex flex-col md:flex-row gap-6">
              <div className="flex-1">
                <h3 className="text-sm font-medium mb-2">Select a Date</h3>
                <div className="border rounded-md p-1">
                  <Calendar
                    mode="single"
                    selected={selectedDate}
                    onSelect={handleDateSelect}
                    disabled={disabledDays}
                    className="p-3 pointer-events-auto"
                  />
                </div>
              </div>
              
              <div className="flex-1">
                <h3 className="text-sm font-medium mb-2">Available Time Slots</h3>
                {selectedDate ? (
                  timeSlots.length > 0 ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      {timeSlots.map((time) => (
                        <Button
                          key={time}
                          variant={selectedTime === time ? "default" : "outline"}
                          className="justify-start text-sm w-full truncate"
                          onClick={() => handleTimeSelect(time)}
                        >
                          <Clock className="mr-2 h-4 w-4 flex-shrink-0" />
                          <span className="truncate">{time}</span>
                        </Button>
                      ))}
                    </div>
                  ) : (
                    <div className="flex flex-col items-center justify-center h-40 text-center">
                      <CalendarIcon className="h-10 w-10 text-muted-foreground opacity-30 mb-2" />
                      <p className="text-muted-foreground">No available slots for this date</p>
                      <p className="text-xs text-muted-foreground mt-1">Please select another date</p>
                    </div>
                  )
                ) : (
                  <div className="flex flex-col items-center justify-center h-40 text-center">
                    <CalendarIcon className="h-10 w-10 text-muted-foreground opacity-30 mb-2" />
                    <p className="text-muted-foreground">Select a date to see available times</p>
                  </div>
                )}
              </div>
            </div>
            
            {selectedDate && selectedTime && (
              <div className="bg-primary/10 rounded-md p-4">
                <h3 className="font-medium mb-2">Booking Summary</h3>
                <div className="flex flex-col gap-2">
                  <div className="flex items-center gap-2">
                    <CalendarIcon className="h-4 w-4 text-primary flex-shrink-0" />
                    <span className="text-sm break-words">{format(selectedDate, 'EEEE, MMMM d, yyyy')}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Clock className="h-4 w-4 text-primary flex-shrink-0" />
                    <span className="text-sm">{selectedTime}</span>
                  </div>
                </div>
                <p className="text-xs text-muted-foreground mt-2">
                  You'll receive an email confirmation and calendar invite after booking
                </p>
              </div>
            )}
          </>
        )}
      </CardContent>
      
      <CardFooter>
        <Button 
          onClick={handleBookInterview} 
          disabled={!selectedDate || !selectedTime || isBooking || !canBook}
          className="w-full flex gap-2"
        >
          {isBooking ? (
            <>Processing...</>
          ) : (
            <>
              <CheckCircle className="h-4 w-4" />
              Book Interview
              <ArrowRight className="h-4 w-4 ml-auto" />
            </>
          )}
        </Button>
      </CardFooter>
    </Card>
  );
};

export default BookingCalendar;
