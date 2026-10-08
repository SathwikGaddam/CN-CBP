import React, { useState } from 'react';
import './EventLog.css';

function EventLog({ events }) {
  const [cleared, setCleared] = useState(false);

  if (cleared || !events || events.length === 0) {
    return (
      <div className="event-log-container glass-panel">
        <div className="log-header">
          <h3>Event Log</h3>
          <button className="btn primary" onClick={() => setCleared(false)}>Restore Log</button>
        </div>
        <div className="empty-log">Log is empty.</div>
      </div>
    );
  }

  const formatTime = (ms) => {
    const seconds = Math.floor(ms / 1000);
    const millis = ms % 1000;
    const sStr = seconds.toString().padStart(2, '0');
    const mStr = millis.toString().padStart(3, '0');
    return `${sStr}:${mStr}`;
  };

  return (
    <div className="event-log-container glass-panel">
      <div className="log-header">
        <h3>Event Log</h3>
        <button className="btn danger" onClick={() => setCleared(true)}>Clear Log</button>
      </div>
      <div className="events-list">
        {events.map((evt, index) => (
          <div key={evt.id || index} className={`event-item ${evt.type.toLowerCase()}`}>
            <span className="event-time">{formatTime(evt.time)}</span>
            <span className="event-message">{evt.message}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

export default EventLog;
