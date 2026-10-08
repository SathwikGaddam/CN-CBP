/**
 * Selective Repeat ARQ Protocol Implementation
 * 
 * EDUCATIONAL OVERVIEW:
 * Selective Repeat is the most efficient ARQ protocol. It avoids Go-Back-N's wasteful 
 * retransmissions by only retransmitting the exact packets that were lost.
 * 
 * Key Concepts:
 * - Independent Timers: Every single packet sent has its own timeout timer.
 * - Individual ACKs: An ACK for packet N strictly confirms ONLY packet N.
 * - Receiver Buffering: The receiver maintains its own sliding window. It accepts 
 *   out-of-order packets and buffers them until all missing preceding packets arrive.
 * - Selective Retransmission: On timeout for packet N, ONLY packet N is retransmitted.
 */

import { SimulationEngine, EVENT_TYPES } from '../utils/simulation';

export function runSelectiveRepeatSimulation(config) {
  const engine = new SimulationEngine(config);
  const { numPackets, windowSize, packetLoss, ackLoss, transDelay, timeout } = config;

  // SENDER STATE
  let sendBase = 0;
  let nextSeqNum = 0;
  const senderAcked = new Array(numPackets).fill(false); // Tracks which packets are individually ACKed
  const senderTimers = {}; // Maps packet sequence numbers to their independent timer events
  const sendCounts = new Array(numPackets).fill(0); // Tracks how many times a packet was sent (for retransmission logic)
  
  // RECEIVER STATE
  let rcvBase = 0;
  const rcvBuffer = new Array(numPackets).fill(false); // Buffers out-of-order packets
  
  // Helper to start an independent timer for a specific packet
  const startTimer = (time, seq) => {
    const expireTime = time + timeout;
    senderTimers[seq] = expireTime;
    engine.scheduleEvent(expireTime, 'TIMEOUT', { seq, expireTime });
  };
  
  // Helper to cancel a timer when an ACK is received
  const cancelTimer = (seq) => {
    senderTimers[seq] = null;
  };

  engine.scheduleEvent(0, 'TRY_SEND', {});

  while (engine.hasEvents() && rcvBase < numPackets && engine.incrementIterations()) {
    const current = engine.popEvent();
    engine.currentTime = current.time;
    
    if (current.type === 'TIMEOUT') {
      const seq = current.data.seq;
      const expireTime = current.data.expireTime;
      
      // Verify this is the active timer for this packet
      if (senderTimers[seq] !== expireTime) continue;
      
      engine.log(EVENT_TYPES.TIMEOUT, engine.currentTime, seq, `Timeout for Packet ${seq}`);
      engine.stats.timeouts++;
      engine.stats.retransmissions++;
      
      // SELECTIVE REPEAT: We ONLY retransmit the specific packet that timed out!
      engine.log(EVENT_TYPES.RETRANSMISSION, engine.currentTime, seq, `Retransmitting Packet ${seq}`);
      engine.stats.packetsSent++;
      sendCounts[seq]++;
      
      startTimer(engine.currentTime, seq);
      
      if (engine.checkProbability(packetLoss)) {
        engine.stats.lostPackets++;
        engine.log(EVENT_TYPES.PACKET_LOST, engine.currentTime + transDelay / 2, seq, `Packet ${seq} lost`);
      } else {
        engine.scheduleEvent(engine.currentTime + transDelay, 'PACKET_ARRIVE', { seq });
      }
    }
    else if (current.type === 'TRY_SEND') {
      // Send packets as long as they fit within the sender's sliding window
      while (nextSeqNum < sendBase + windowSize && nextSeqNum < numPackets) {
        // Only send if it hasn't been sent yet (retransmissions are handled strictly by TIMEOUT events)
        if (sendCounts[nextSeqNum] === 0) {
           engine.log(EVENT_TYPES.PACKET_SENT, engine.currentTime, nextSeqNum, `Packet ${nextSeqNum} sent`);
           engine.stats.packetsSent++;
           sendCounts[nextSeqNum]++;
           
           startTimer(engine.currentTime, nextSeqNum); // Start its independent timer
           
           if (engine.checkProbability(packetLoss)) {
             engine.stats.lostPackets++;
             engine.log(EVENT_TYPES.PACKET_LOST, engine.currentTime + transDelay / 2, nextSeqNum, `Packet ${nextSeqNum} lost`);
           } else {
             engine.scheduleEvent(engine.currentTime + transDelay, 'PACKET_ARRIVE', { seq: nextSeqNum });
           }
        }
        nextSeqNum++;
      }
    }
    else if (current.type === 'PACKET_ARRIVE') {
      const seq = current.data.seq;
      
      // If the packet falls within the receiver's acceptable window
      if (seq >= rcvBase && seq < rcvBase + windowSize) {
        // Receiver ALWAYS sends an individual ACK for a received packet
        engine.log(EVENT_TYPES.ACK_SENT, engine.currentTime, seq, `ACK ${seq} sent`);
        engine.stats.acksSent++;
        
        if (engine.checkProbability(ackLoss)) {
          engine.stats.lostAcks++;
          engine.log(EVENT_TYPES.ACK_LOST, engine.currentTime + transDelay / 2, seq, `ACK ${seq} lost`);
        } else {
          engine.scheduleEvent(engine.currentTime + transDelay, 'ACK_ARRIVE', { seq });
        }
        
        // BUFFERING LOGIC
        if (!rcvBuffer[seq]) {
          rcvBuffer[seq] = true;
          
          if (seq === rcvBase) {
             // We received the exact packet we were waiting for!
             engine.log(EVENT_TYPES.PACKET_RECEIVED, engine.currentTime, seq, `Packet ${seq} received in order`);
             engine.stats.packetsReceived++;
             
             // Now slide the window forward, delivering any previously buffered out-of-order packets
             while (rcvBase < numPackets && rcvBuffer[rcvBase]) {
               if (rcvBase !== seq) {
                 engine.log(EVENT_TYPES.PACKET_RECEIVED, engine.currentTime, rcvBase, `Buffered Packet ${rcvBase} delivered`);
               }
               rcvBase++;
             }
             engine.log(EVENT_TYPES.WINDOW_MOVED, engine.currentTime, rcvBase, `Receiver window moved to ${rcvBase}`);
          } else {
             // We received a packet out of order. Store it in the buffer.
             engine.log(EVENT_TYPES.BUFFERED, engine.currentTime, seq, `Packet ${seq} received out of order and BUFFERED`);
             engine.stats.packetsReceived++;
          }
        }
      } 
      else if (seq >= rcvBase - windowSize && seq < rcvBase) {
        // Edge Case: We received a packet we already successfully delivered. 
        // This happens if our ACK was lost. We MUST re-acknowledge it so the sender can advance.
        engine.log(EVENT_TYPES.DISCARDED, engine.currentTime, seq, `Packet ${seq} already delivered. Resending ACK.`);
        engine.log(EVENT_TYPES.ACK_SENT, engine.currentTime, seq, `ACK ${seq} sent (re-ack)`);
        engine.stats.acksSent++;
        
        if (engine.checkProbability(ackLoss)) {
          engine.stats.lostAcks++;
          engine.log(EVENT_TYPES.ACK_LOST, engine.currentTime + transDelay / 2, seq, `ACK ${seq} lost`);
        } else {
          engine.scheduleEvent(engine.currentTime + transDelay, 'ACK_ARRIVE', { seq });
        }
      }
    }
    else if (current.type === 'ACK_ARRIVE') {
      const seq = current.data.seq;
      
      // If the ACK falls within the sender's unacknowledged window
      if (seq >= sendBase && seq < sendBase + windowSize) {
         engine.log(EVENT_TYPES.ACK_RECEIVED, engine.currentTime, seq, `ACK ${seq} received`);
         engine.stats.acksReceived++;
         
         if (!senderAcked[seq]) {
           senderAcked[seq] = true; // Mark this specific packet as acknowledged
           cancelTimer(seq);        // Cancel its independent timer
           
           // If the ACK was for the oldest unacknowledged packet, slide the window!
           if (seq === sendBase) {
             while (sendBase < numPackets && senderAcked[sendBase]) {
               sendBase++;
             }
             engine.log(EVENT_TYPES.WINDOW_MOVED, engine.currentTime, sendBase, `Sender window moved to ${sendBase}`);
             
             // Now that the window moved, we might have room to send new packets
             engine.scheduleEvent(engine.currentTime, 'TRY_SEND', {});
           }
         }
      }
    }
  }

  engine.stats.totalTime = Math.round(engine.currentTime);
  return { events: engine.events, stats: engine.stats };
}
