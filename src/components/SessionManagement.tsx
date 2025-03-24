
import React, { useState } from 'react';
import SessionPoolStatus from './session/SessionPoolStatus';
import SessionDuration from './session/SessionDuration';
import SessionPurchase from './session/SessionPurchase';
import SessionAllocation from './session/SessionAllocation';
import { useIsMobile } from '@/hooks/use-mobile';

interface SessionManagementProps {
  onSessionPurchase?: (sessions: number, cost: number) => void;
}

const SessionManagement = ({ onSessionPurchase }: SessionManagementProps) => {
  const [sessionLength, setSessionLength] = useState(20); // Default 20 minutes
  const [totalSessions, setTotalSessions] = useState(1000);
  const [usedSessions, setUsedSessions] = useState(362);
  const isMobile = useIsMobile();
  
  const pricePerMinute = 0.15; // $0.15 per minute
  const sessionCost = (sessionLength * pricePerMinute).toFixed(2);
  
  const handleSessionPurchase = (sessions: number, cost: number) => {
    setTotalSessions(prev => prev + sessions);
    
    // Notify parent component about session purchase for billing update
    if (onSessionPurchase) {
      onSessionPurchase(sessions, cost);
    }
  };
  
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <SessionPoolStatus 
          totalSessions={totalSessions} 
          usedSessions={usedSessions} 
        />
        <SessionDuration 
          sessionLength={sessionLength} 
          setSessionLength={setSessionLength} 
          pricePerMinute={pricePerMinute} 
        />
      </div>
      
      <SessionPurchase 
        sessionLength={sessionLength} 
        sessionCost={sessionCost} 
        onSessionPurchase={handleSessionPurchase} 
      />
      
      <SessionAllocation />
    </div>
  );
};

export default SessionManagement;
