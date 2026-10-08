import React from 'react';
import './EducationalPanel.css';

function EducationalPanel({ protocol }) {
  const info = {
    'stop-and-wait': {
      title: 'Stop-and-Wait ARQ',
      description: 'The simplest Automatic Repeat reQuest (ARQ) protocol. The sender transmits one packet and stops, waiting for an acknowledgment (ACK) before sending the next one.',
      points: [
        'Sends one packet at a time.',
        'Waits for an ACK before continuing.',
        'Simple to implement but slower.'
      ],
      advantages: 'Extremely simple logic. Requires very little buffer space (only 1 packet) at both ends.',
      disadvantages: 'Very inefficient on networks with high propagation delay (low bandwidth-delay product).',
      typicalUse: 'Simple, low-cost devices or environments where delays are negligible.'
    },
    'go-back-n': {
      title: 'Go-Back-N ARQ',
      description: 'A sliding window protocol where the sender can transmit multiple packets before receiving an ACK, but the receiver only accepts packets in strict order.',
      points: [
        'Uses a sliding window to send multiple packets.',
        'Uses cumulative ACKs (ACK N confirms all packets up to N).',
        'Discards out-of-order packets at the receiver.',
        'Retransmits the lost packet AND all subsequent packets.'
      ],
      advantages: 'High throughput compared to Stop-and-Wait. Simple receiver logic since no buffering is needed.',
      disadvantages: 'Wasteful retransmissions. If one packet is lost, many successfully sent packets are discarded and resent.',
      typicalUse: 'Systems where receiver memory is highly constrained, or where error rates are extremely low.'
    },
    'selective-repeat': {
      title: 'Selective Repeat ARQ',
      description: 'The most efficient ARQ protocol. Both sender and receiver maintain a sliding window. The receiver accepts and buffers out-of-order packets.',
      points: [
        'Uses a sliding window for both sender and receiver.',
        'Accepts and buffers out-of-order packets.',
        'Uses individual ACKs for each packet.',
        'Retransmits ONLY the specifically lost packets.'
      ],
      advantages: 'Highly efficient. Minimizes wasted bandwidth by avoiding unnecessary retransmissions.',
      disadvantages: 'More complex to implement. Requires significant buffer memory at both the sender and receiver to store out-of-order packets and sort them.',
      typicalUse: 'Modern transport protocols (like TCP variations), satellite links, and environments with high error rates or high delays.'
    },
    'compare-all': {
      title: 'Compare Protocols',
      description: 'Run all three ARQ protocols simultaneously under identical network conditions (same packet loss, ACK loss, and delays) to visualize their performance differences.',
      points: [
        'Benchmarks Stop-and-Wait, Go-Back-N, and Selective Repeat.',
        'Compares total retransmissions and timeouts.',
        'Evaluates Delivery Efficiency.'
      ],
      advantages: 'Provides immediate visual proof of protocol trade-offs.',
      disadvantages: 'Requires simulating all three algorithms consecutively.',
      typicalUse: 'Educational demonstrations and stress-testing network configurations.'
    }
  };

  const data = info[protocol];
  if (!data) return null;

  return (
    <div className="educational-panel">
      <h2>{data.title}</h2>
      <p className="edu-description">{data.description}</p>
      
      <div className="edu-grid">
        <div className="edu-card how-it-works">
          <h4>How it works</h4>
          <ul>
            {data.points.map((pt, i) => <li key={i}>{pt}</li>)}
          </ul>
        </div>
        
        <div className="edu-card advantages">
          <h4>Advantages</h4>
          <p>{data.advantages}</p>
        </div>
        
        <div className="edu-card disadvantages">
          <h4>Disadvantages</h4>
          <p>{data.disadvantages}</p>
        </div>
        
        <div className="edu-card typical-use">
          <h4>Typical Use</h4>
          <p>{data.typicalUse}</p>
        </div>
      </div>
    </div>
  );
}

export default EducationalPanel;
