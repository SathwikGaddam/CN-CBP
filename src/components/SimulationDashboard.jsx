import React from 'react';
import './SimulationDashboard.css';
import EventLog from './EventLog';
import Statistics from './Statistics';

function SimulationDashboard({ stats, events }) {
  if (!stats || !events) return null;

  return (
    <div className="simulation-dashboard">
      <Statistics stats={stats} />
      <EventLog events={events} />
    </div>
  );
}

export default SimulationDashboard;
