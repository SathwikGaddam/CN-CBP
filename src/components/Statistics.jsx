import React from 'react';
import './Statistics.css';

function Statistics({ stats }) {
  if (!stats) return null;

  const deliveryEfficiency = stats.packetsSent > 0 
    ? ((stats.packetsReceived / stats.packetsSent) * 100).toFixed(2) 
    : '0.00';

  return (
    <div className="statistics-container glass-panel">
      <h3>Simulation Statistics</h3>
      <div className="stats-grid">
        <div className="stat-card">
          <span className="stat-label">Packets Sent</span>
          <span className="stat-value">{stats.packetsSent}</span>
        </div>
        <div className="stat-card">
          <span className="stat-label">Packets Received</span>
          <span className="stat-value">{stats.packetsReceived}</span>
        </div>
        <div className="stat-card danger">
          <span className="stat-label">Packets Lost</span>
          <span className="stat-value">{stats.lostPackets}</span>
        </div>
        
        <div className="stat-card">
          <span className="stat-label">ACKs Sent</span>
          <span className="stat-value">{stats.acksSent}</span>
        </div>
        <div className="stat-card">
          <span className="stat-label">ACKs Received</span>
          <span className="stat-value">{stats.acksReceived}</span>
        </div>
        <div className="stat-card danger">
          <span className="stat-label">ACKs Lost</span>
          <span className="stat-value">{stats.lostAcks}</span>
        </div>
        
        <div className="stat-card warning">
          <span className="stat-label">Retransmissions</span>
          <span className="stat-value">{stats.retransmissions}</span>
        </div>
        <div className="stat-card warning">
          <span className="stat-label">Timeouts</span>
          <span className="stat-value">{stats.timeouts}</span>
        </div>
        <div className="stat-card highlight">
          <span className="stat-label">Simulation Time</span>
          <span className="stat-value">{stats.totalTime} ms</span>
        </div>

        <div className="stat-card efficiency">
          <span className="stat-label">Delivery Efficiency</span>
          <span className="stat-value">{deliveryEfficiency}%</span>
          <span className="stat-formula">(Successfully Delivered / Total Packets Sent × 100)</span>
        </div>
      </div>
    </div>
  );
}

export default Statistics;
