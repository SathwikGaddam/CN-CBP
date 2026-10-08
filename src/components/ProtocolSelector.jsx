import React from 'react';
import './ProtocolSelector.css';

function ProtocolSelector({ protocol, setProtocol, simState }) {
  const protocols = [
    { id: 'stop-and-wait', label: 'Stop-and-Wait ARQ' },
    { id: 'go-back-n', label: 'Go-Back-N ARQ' },
    { id: 'selective-repeat', label: 'Selective Repeat ARQ' }
  ];

  return (
    <div className="protocol-selector card">
      <h2>Select a Protocol</h2>
      <div className="protocol-options">
        {protocols.map((p) => (
          <button
            key={p.id}
            className={`btn primary ${protocol === p.id ? 'active' : ''}`}
            onClick={() => setProtocol(p.id)}
            disabled={simState !== 'idle'}
          >
            {p.label}
          </button>
        ))}
        <button
          className={`btn highlight ${protocol === 'compare-all' ? 'active' : ''}`}
          onClick={() => setProtocol('compare-all')}
          disabled={simState !== 'idle'}
          style={{marginLeft: 'auto'}}
        >
          Compare All
        </button>
      </div>
    </div>
  );
}

export default ProtocolSelector;
