import React, { useState } from 'react';
import './App.css';
import ProtocolSelector from './components/ProtocolSelector';
import Controls from './components/Controls';
import SimulationDashboard from './components/SimulationDashboard';
import NetworkVisualizer from './components/NetworkVisualizer';
import ProtocolComparison from './components/ProtocolComparison';
import EducationalPanel from './components/EducationalPanel';
import { runStopAndWaitSimulation } from './protocols/stopAndWait';
import { runGoBackNSimulation } from './protocols/goBackN';
import { runSelectiveRepeatSimulation } from './protocols/selectiveRepeat';

function App() {
  const [protocol, setProtocol] = useState('stop-and-wait');
  const [simState, setSimState] = useState('idle'); // 'idle', 'running', 'paused', 'finished', 'finished-compare'
  const [config, setConfig] = useState({
    numPackets: 10,
    windowSize: 4,
    packetLoss: 20,
    ackLoss: 10,
    transDelay: 1000,
    timeout: 2500
  });

  const [simulationData, setSimulationData] = useState({ events: [], stats: null });
  const [comparisonData, setComparisonData] = useState(null);

  const handleStart = () => {
    setSimState('running');
    
    // Use setTimeout to allow the browser to paint the 'running' (loading) state
    setTimeout(() => {
      if (protocol === 'compare-all') {
        const dataSW = runStopAndWaitSimulation(config);
        const dataGBN = runGoBackNSimulation(config);
        const dataSR = runSelectiveRepeatSimulation(config);
        setComparisonData({ sw: dataSW.stats, gbn: dataGBN.stats, sr: dataSR.stats });
        setSimState('finished-compare');
      } else if (protocol === 'stop-and-wait') {
        const data = runStopAndWaitSimulation(config);
        setSimulationData(data);
        setSimState('finished');
      } else if (protocol === 'go-back-n') {
        const data = runGoBackNSimulation(config);
        setSimulationData(data);
        setSimState('finished');
      } else if (protocol === 'selective-repeat') {
        const data = runSelectiveRepeatSimulation(config);
        setSimulationData(data);
        setSimState('finished');
      } else {
        alert(`${protocol} is not fully implemented yet.`);
        setSimState('idle');
      }
    }, 300); // 300ms fake loading for polished UX feeling
  };

  const handlePause = () => setSimState('paused');
  const handleResume = () => setSimState('running');
  
  const handleReset = () => {
    setSimState('idle');
    setSimulationData({ events: [], stats: null });
    setComparisonData(null);
  };

  return (
    <div className="app-container">
      <header className="app-header">
        <h1>Reliable Data Transfer & ARQ Simulator</h1>
        <p className="app-description">
          Interactive simulation and performance comparison of ARQ protocols used for reliable data transmission.
        </p>
      </header>

      <main className="app-main">
        <ProtocolSelector 
          protocol={protocol} 
          setProtocol={setProtocol} 
          simState={simState} 
        />
        
        <Controls 
          config={config} 
          setConfig={setConfig} 
          simState={simState}
          protocol={protocol}
          onStart={handleStart}
          onPause={handlePause}
          onResume={handleResume}
          onReset={handleReset}
        />
        
        <section className="simulation-area glass-panel">
          {simState === 'idle' ? (
            <EducationalPanel protocol={protocol} />
          ) : simState === 'running' ? (
            <div className="loading-state">
               <div className="spinner"></div>
               <p>Simulating Network Traffic...</p>
            </div>
          ) : simState === 'finished-compare' ? (
            <ProtocolComparison data={comparisonData} />
          ) : (
            <div className="simulation-content">
              <NetworkVisualizer 
                events={simulationData.events} 
                config={config} 
                protocol={protocol}
              />
              <SimulationDashboard 
                stats={simulationData.stats} 
                events={simulationData.events} 
              />
            </div>
          )}
        </section>
      </main>
      
      <footer className="app-footer">
        <p>Developed for Computer Networks CBP Project</p>
      </footer>
    </div>
  );
}

export default App;
