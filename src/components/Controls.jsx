import React from 'react';
import './Controls.css';

function Controls({ config, setConfig, simState, onStart, onPause, onResume, onReset, protocol }) {
  const handleChange = (e) => {
    const { name, value } = e.target;
    let numValue = parseInt(value, 10) || 0;
    
    // Validation
    if (name === 'numPackets' && numValue < 1) numValue = 1;
    if (name === 'numPackets' && numValue > 100) numValue = 100;
    if (name === 'windowSize' && numValue < 1) numValue = 1;
    if (name === 'windowSize' && numValue > 20) numValue = 20;
    if (name === 'packetLoss' && numValue < 0) numValue = 0;
    if (name === 'packetLoss' && numValue > 100) numValue = 100;
    if (name === 'ackLoss' && numValue < 0) numValue = 0;
    if (name === 'ackLoss' && numValue > 100) numValue = 100;
    if (name === 'transDelay' && numValue < 100) numValue = 100;
    if (name === 'timeout' && numValue < 100) numValue = 100;

    setConfig(prev => ({ ...prev, [name]: numValue }));
  };

  const isRunning = simState === 'running';
  const isPaused = simState === 'paused';
  const isIdle = simState === 'idle';

  return (
    <div className="controls-panel glass-panel">
      <h3>Simulation Controls</h3>
      
      <div className="config-grid">
        <div className="input-group">
          <label>Number of Packets</label>
          <input 
            type="number" 
            name="numPackets" 
            value={config.numPackets} 
            onChange={handleChange}
            disabled={!isIdle}
            min="1" max="100"
          />
        </div>
        
        <div className="input-group">
          <label>Window Size {protocol === 'stop-and-wait' && '(Fixed to 1)'}</label>
          <input 
            type="number" 
            name="windowSize" 
            value={protocol === 'stop-and-wait' ? 1 : config.windowSize} 
            onChange={handleChange}
            disabled={!isIdle || protocol === 'stop-and-wait'}
            min="1" max="20"
          />
        </div>

        <div className="input-group">
          <label>Packet Loss Prob. (%)</label>
          <input 
            type="number" 
            name="packetLoss" 
            value={config.packetLoss} 
            onChange={handleChange}
            disabled={!isIdle}
            min="0" max="100"
          />
        </div>

        <div className="input-group">
          <label>ACK Loss Prob. (%)</label>
          <input 
            type="number" 
            name="ackLoss" 
            value={config.ackLoss} 
            onChange={handleChange}
            disabled={!isIdle}
            min="0" max="100"
          />
        </div>

        <div className="input-group">
          <label>Trans. Delay (ms)</label>
          <input 
            type="number" 
            name="transDelay" 
            value={config.transDelay} 
            onChange={handleChange}
            disabled={!isIdle}
            step="100" min="100"
          />
        </div>

        <div className="input-group">
          <label>Timeout (ms)</label>
          <input 
            type="number" 
            name="timeout" 
            value={config.timeout} 
            onChange={handleChange}
            disabled={!isIdle}
            step="100" min="100"
          />
        </div>
      </div>

      <div className="action-buttons">
        {isIdle && (
          <button className="btn success" onClick={onStart}>
            Start Simulation
          </button>
        )}
        
        {isRunning && (
          <button className="btn warning" onClick={onPause}>
            Pause
          </button>
        )}

        {isPaused && (
          <button className="btn success" onClick={onResume}>
            Resume
          </button>
        )}

        {!isIdle && (
          <button className="btn danger" onClick={onReset}>
            Reset
          </button>
        )}
      </div>
    </div>
  );
}

export default Controls;
