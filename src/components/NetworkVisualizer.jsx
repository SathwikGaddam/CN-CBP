import React, { useState, useEffect, useRef, useMemo } from 'react';
import './NetworkVisualizer.css';
import { EVENT_TYPES } from '../utils/simulation';

function NetworkVisualizer({ events, config, protocol }) {
  const [currentTime, setCurrentTime] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [playbackSpeed, setPlaybackSpeed] = useState(2);
  const animationRef = useRef();
  
  const maxTime = events.length > 0 ? events[events.length - 1].time + 1000 : 0;
  const actualWindowSize = protocol === 'stop-and-wait' ? 1 : config.windowSize;

  useEffect(() => {
    if (isPlaying) {
      let lastTimestamp = performance.now();
      const animate = (timestamp) => {
        const delta = timestamp - lastTimestamp;
        lastTimestamp = timestamp;
        
        setCurrentTime(prev => {
          const next = prev + delta * playbackSpeed; 
          if (next >= maxTime) {
            setIsPlaying(false);
            return maxTime;
          }
          return next;
        });
        
        animationRef.current = requestAnimationFrame(animate);
      };
      animationRef.current = requestAnimationFrame(animate);
    }
    return () => cancelAnimationFrame(animationRef.current);
  }, [isPlaying, maxTime, playbackSpeed]);

  const handlePlayPause = () => {
    if (currentTime >= maxTime) {
      setCurrentTime(0);
    }
    setIsPlaying(!isPlaying);
  };

  const handleSliderChange = (e) => {
    setCurrentTime(Number(e.target.value));
  };

  const allFlights = useMemo(() => {
    const flights = [];
    events.forEach(evt => {
      if (evt.type === EVENT_TYPES.PACKET_SENT || evt.type === EVENT_TYPES.RETRANSMISSION) {
        const terminator = events.find(e => e.time > evt.time && e.packet === evt.packet && 
            [EVENT_TYPES.PACKET_LOST, EVENT_TYPES.PACKET_RECEIVED, EVENT_TYPES.BUFFERED, EVENT_TYPES.DISCARDED].includes(e.type));
        
        const endTime = terminator ? terminator.time : evt.time + config.transDelay;
        flights.push({
          id: `pkt_${evt.id}`,
          type: 'packet',
          seq: evt.packet,
          startTime: evt.time,
          endTime,
          isLost: terminator?.type === EVENT_TYPES.PACKET_LOST
        });
      }
      else if (evt.type === EVENT_TYPES.ACK_SENT) {
        const terminator = events.find(e => e.time > evt.time && e.packet === evt.packet && 
            [EVENT_TYPES.ACK_LOST, EVENT_TYPES.ACK_RECEIVED].includes(e.type));
        
        const endTime = terminator ? terminator.time : evt.time + config.transDelay;
        flights.push({
          id: `ack_${evt.id}`,
          type: 'ack',
          seq: evt.packet,
          startTime: evt.time,
          endTime,
          isLost: terminator?.type === EVENT_TYPES.ACK_LOST
        });
      }
    });
    return flights;
  }, [events, config.transDelay]);

  const { packetStates, receiverStates, sendBase, rcvBase } = useMemo(() => {
    const pStates = Array(config.numPackets).fill('Waiting');
    const rStates = Array(config.numPackets).fill('Waiting');
    
    events.filter(e => e.time <= currentTime).forEach(evt => {
       const seq = evt.packet;
       if (seq === undefined || seq < 0 || seq >= config.numPackets) return;
       
       if (evt.type === EVENT_TYPES.PACKET_SENT) pStates[seq] = 'Sending';
       else if (evt.type === EVENT_TYPES.RETRANSMISSION) pStates[seq] = 'Retransmitting';
       else if (evt.type === EVENT_TYPES.PACKET_LOST) pStates[seq] = 'Lost';
       else if (evt.type === EVENT_TYPES.ACK_RECEIVED) pStates[seq] = 'ACKed';
       else if (evt.type === EVENT_TYPES.TIMEOUT) pStates[seq] = 'Timeout';
       
       if (evt.type === EVENT_TYPES.PACKET_RECEIVED) rStates[seq] = 'Received';
       else if (evt.type === EVENT_TYPES.BUFFERED) rStates[seq] = 'Buffered';
       else if (evt.type === EVENT_TYPES.DISCARDED) rStates[seq] = 'Discarded'; 
    });

    // Compute sendBase: first non-ACKed packet
    let sBase = 0;
    while (sBase < config.numPackets && pStates[sBase] === 'ACKed') {
      sBase++;
    }

    // Compute rcvBase: first non-Received packet
    let rBase = 0;
    while (rBase < config.numPackets && rStates[rBase] === 'Received') {
      rBase++;
    }

    return { packetStates: pStates, receiverStates: rStates, sendBase: sBase, rcvBase: rBase };
  }, [events, currentTime, config.numPackets]);

  const formatTime = (t) => Math.round(t) + ' ms';

  return (
    <div className="visualization-container glass-panel">
      <h3>Network Animation</h3>
      
      <div className="timeline-controls">
        <button className={`btn ${isPlaying ? 'warning' : 'success'}`} onClick={handlePlayPause}>
          {isPlaying ? 'Pause' : (currentTime >= maxTime ? 'Replay' : 'Play')}
        </button>
        <input 
          type="range" 
          min="0" 
          max={maxTime} 
          value={currentTime} 
          onChange={handleSliderChange} 
          className="time-slider"
        />
        <span className="time-display">{formatTime(currentTime)} / {formatTime(maxTime)}</span>
        <select 
          className="speed-selector" 
          value={playbackSpeed} 
          onChange={e => setPlaybackSpeed(Number(e.target.value))}
        >
          <option value={0.5}>0.5x</option>
          <option value={1}>1x</option>
          <option value={2}>2x</option>
          <option value={4}>4x</option>
        </select>
      </div>

      <div className="diagram-scroll-area">
        <div className="network-diagram">
          
          <div className="node-layer">
             <div className="layer-label">SENDER</div>
             <div className="boxes-container">
               <div className="boxes">
                 {packetStates.map((state, i) => (
                   <div key={i} className={`box ${state.toLowerCase()}`} title={`Packet ${i}: ${state}`}>
                     {i}
                   </div>
                 ))}
               </div>
               <div 
                 className="window-bracket" 
                 style={{ 
                   left: `${sendBase * 40}px`, 
                   width: `${Math.min(actualWindowSize, config.numPackets - sendBase) * 40 - 8}px`
                 }}
               >
                 <div className="window-label">Current Window</div>
               </div>
             </div>
          </div>
          
          <div className="network-layer">
             {allFlights.map(flight => {
               const isActive = currentTime >= flight.startTime && currentTime <= flight.endTime;
               const showExplosion = currentTime > flight.endTime && flight.isLost && currentTime < flight.endTime + 600;
               if (!isActive && !showExplosion) return null;
               
               const progress = Math.min(1, Math.max(0, (currentTime - flight.startTime) / (flight.endTime - flight.startTime)));
               
               // Top is 0%, Bottom is 100%
               const topPos = flight.type === 'packet' ? (progress * 100) : (100 - progress * 100);
               const leftPos = (flight.seq * 40) + 16; 
               
               return (
                 <div key={flight.id} 
                      className={`flight-entity ${flight.type} ${showExplosion ? 'explosion' : ''}`}
                      style={{ left: `${leftPos}px`, top: `${topPos}%` }}>
                    {showExplosion ? '❌' : (flight.type === 'packet' ? `P${flight.seq}` : `A${flight.seq}`)}
                 </div>
               );
             })}
          </div>

          <div className="node-layer">
             <div className="layer-label">RECEIVER</div>
             <div className="boxes-container">
               <div className="boxes">
                 {receiverStates.map((state, i) => (
                   <div key={i} className={`box ${state.toLowerCase()}`} title={`Packet ${i}: ${state}`}>
                     {i}
                   </div>
                 ))}
               </div>
               {(protocol === 'selective-repeat' || protocol === 'go-back-n') && (
                 <div 
                   className="window-bracket receiver-bracket" 
                   style={{ 
                     left: `${rcvBase * 40}px`, 
                     width: `${Math.min(actualWindowSize, config.numPackets - rcvBase) * 40 - 8}px`
                   }}
                 >
                 </div>
               )}
             </div>
          </div>

        </div>
      </div>
      
      <div className="legend">
         <span className="legend-item"><span className="box-mini acked"></span> ACKed/Rcvd</span>
         <span className="legend-item"><span className="box-mini sending"></span> Sending</span>
         <span className="legend-item"><span className="box-mini lost"></span> Lost/Timeout</span>
         <span className="legend-item"><span className="box-mini buffered"></span> Buffered</span>
         <span className="legend-item"><span className="box-mini discarded"></span> Discarded</span>
      </div>
    </div>
  );
}

export default NetworkVisualizer;
