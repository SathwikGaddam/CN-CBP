/**
 * Go-Back-N ARQ Protocol Implementation
 * 
 * EDUCATIONAL OVERVIEW:
 * Go-Back-N improves upon Stop-and-Wait by allowing the sender to transmit multiple packets 
 * without waiting for an ACK, up to a maximum "Window Size".
 * 
 * Key Concepts:
 * - Sliding Window: The sender maintains a window of unacknowledged packets.
 * - Cumulative ACKs: An ACK for packet N implies all packets up to N have been received.
 * - No Receiver Buffering: The receiver strictly expects packets in order. If a packet is lost,
 *   all subsequent out-of-order packets are discarded.
 * - "Go Back N": On timeout, the sender goes back and retransmits the lost packet AND all 
 *   subsequent packets in the window.
 */

import { SimulationEngine, EVENT_TYPES } from '../utils/simulation';

export function runGoBackNSimulation(config) {
  const engine = new SimulationEngine(config);
  const { numPackets, windowSize, packetLoss, ackLoss, transDelay, timeout } = config;

  let base = 0;              // The oldest unacknowledged packet (start of the window)
  let nextSeqNum = 0;        // The next packet to be sent
  let expectedSeqNum = 0;    // The strict next packet the receiver is expecting
  let highestSent = -1;      // Tracks the highest packet sent to identify retransmissions
  let timerEvent = null;     // GBN uses a single logical timer for the oldest un-ACKed packet (the base)

  engine.scheduleEvent(0, 'TRY_SEND', {});

  // Helper to start the single logical timer for the 'base' packet
  const startTimer = (time) => {
    timerEvent = { time: time + timeout, type: 'TIMEOUT', data: { seq: base } };
    engine.scheduleEvent(timerEvent.time, timerEvent.type, timerEvent.data);
  };

  while (engine.hasEvents() && base < numPackets && engine.incrementIterations()) {
    const current = engine.popEvent();
    engine.currentTime = current.time;
    
    // Ignore obsolete timeouts (e.g. if the base moved forward before the old timer popped)
    if (current.type === 'TIMEOUT' && current.data.seq !== base) {
       continue; 
    }

    if (current.type === 'TRY_SEND') {
      // Send packets as long as they fit within the sliding window
      while (nextSeqNum < base + windowSize && nextSeqNum < numPackets) {
        
        if (nextSeqNum <= highestSent) {
          engine.stats.retransmissions++;
          engine.log(EVENT_TYPES.RETRANSMISSION, engine.currentTime, nextSeqNum, `Retransmitting Packet ${nextSeqNum}`);
        } else {
          highestSent = nextSeqNum;
        }

        engine.log(EVENT_TYPES.PACKET_SENT, engine.currentTime, nextSeqNum, `Packet ${nextSeqNum} sent`);
        engine.stats.packetsSent++;
        
        // Start the timer ONLY for the first packet in the window (the base)
        if (base === nextSeqNum) {
          startTimer(engine.currentTime);
        }

        // Network simulation: Does it get lost?
        if (engine.checkProbability(packetLoss)) {
          engine.stats.lostPackets++;
          engine.log(EVENT_TYPES.PACKET_LOST, engine.currentTime + transDelay / 2, nextSeqNum, `Packet ${nextSeqNum} lost`);
        } else {
          engine.scheduleEvent(engine.currentTime + transDelay, 'PACKET_ARRIVE', { seq: nextSeqNum });
        }
        
        nextSeqNum++;
      }
    } 
    else if (current.type === 'PACKET_ARRIVE') {
      const seq = current.data.seq;
      
      // Strict Order Check: Does this match exactly what the receiver expects?
      if (seq === expectedSeqNum) {
        engine.log(EVENT_TYPES.PACKET_RECEIVED, engine.currentTime, seq, `Packet ${seq} received in order`);
        engine.stats.packetsReceived++;
        
        // Send a Cumulative ACK
        engine.log(EVENT_TYPES.ACK_SENT, engine.currentTime, seq, `ACK ${seq} sent`);
        engine.stats.acksSent++;
        expectedSeqNum++; // Receiver moves its expectation forward

        if (engine.checkProbability(ackLoss)) {
          engine.stats.lostAcks++;
          engine.log(EVENT_TYPES.ACK_LOST, engine.currentTime + transDelay / 2, seq, `ACK ${seq} lost`);
        } else {
          engine.scheduleEvent(engine.currentTime + transDelay, 'ACK_ARRIVE', { seq });
        }
      } else {
        // Out of order! Go-Back-N strictly discards out-of-order packets.
        engine.log(EVENT_TYPES.DISCARDED, engine.currentTime, seq, `Packet ${seq} discarded (expected ${expectedSeqNum})`);
        
        // It resends an ACK for the last successfully received packet to hint the sender
        if (expectedSeqNum > 0) {
          const lastAck = expectedSeqNum - 1;
          engine.log(EVENT_TYPES.ACK_SENT, engine.currentTime, lastAck, `ACK ${lastAck} sent (re-ack)`);
          engine.stats.acksSent++;
          if (engine.checkProbability(ackLoss)) {
            engine.stats.lostAcks++;
            engine.log(EVENT_TYPES.ACK_LOST, engine.currentTime + transDelay / 2, lastAck, `ACK ${lastAck} lost`);
          } else {
            engine.scheduleEvent(engine.currentTime + transDelay, 'ACK_ARRIVE', { seq: lastAck });
          }
        }
      }
    }
    else if (current.type === 'ACK_ARRIVE') {
      const ackSeq = current.data.seq;
      engine.log(EVENT_TYPES.ACK_RECEIVED, engine.currentTime, ackSeq, `ACK ${ackSeq} received`);
      engine.stats.acksReceived++;
      
      // Cumulative ACK Processing: An ACK for N confirms everything up to N
      if (ackSeq >= base) {
        base = ackSeq + 1; // Slide the window forward
        engine.log(EVENT_TYPES.WINDOW_MOVED, engine.currentTime, base, `Window base moved to ${base}`);
        
        // Restart the timer if there are still unacknowledged packets in flight
        if (base < nextSeqNum) {
          startTimer(engine.currentTime);
        } else {
          timerEvent = null; // Everything is acknowledged, stop the timer
        }
        
        // Since the window moved, try to send new packets
        engine.scheduleEvent(engine.currentTime, 'TRY_SEND', {});
      }
    }
    else if (current.type === 'TIMEOUT') {
      // The timer for the base packet expired!
      engine.log(EVENT_TYPES.TIMEOUT, engine.currentTime, base, `Timeout for Packet ${base}`);
      engine.stats.timeouts++;
      
      // GO BACK N: Reset the next sequence number all the way back to the base.
      // The TRY_SEND event will retransmit the entire window starting from the base.
      nextSeqNum = base;
      engine.scheduleEvent(engine.currentTime, 'TRY_SEND', {});
    }
  }

  engine.stats.totalTime = Math.round(engine.currentTime);
  return { events: engine.events, stats: engine.stats };
}
