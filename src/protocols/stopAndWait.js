/**
 * Stop-and-Wait ARQ Protocol Implementation
 * 
 * EDUCATIONAL OVERVIEW:
 * Stop-and-Wait is the simplest ARQ protocol. 
 * The Sender transmits one single packet and then absolutely STOPS.
 * It will not send the next packet until it receives an Acknowledgment (ACK) for the current one.
 * If a timeout occurs before the ACK arrives, it retransmits the same packet.
 * 
 * Key Concepts:
 * - Window Size is effectively 1.
 * - Sequence numbers only need to alternate between 0 and 1 (Alternate Bit Protocol).
 */

import { SimulationEngine, EVENT_TYPES } from '../utils/simulation';

export function runStopAndWaitSimulation(config) {
  const engine = new SimulationEngine(config);
  const { numPackets, packetLoss, ackLoss, transDelay, timeout } = config;

  let currentPacket = 0; // Tracks the absolute packet number we are currently trying to send

  // Kick off the simulation by trying to send the very first packet
  engine.scheduleEvent(0, 'TRY_SEND', {});

  // The main discrete-event simulation loop
  while (engine.hasEvents() && currentPacket < numPackets && engine.incrementIterations()) {
    const current = engine.popEvent();
    engine.currentTime = current.time;
    
    // In Stop-and-Wait, the sequence number alternates 0, 1, 0, 1 (modulo 2)
    const seqNum = currentPacket % 2;

    if (current.type === 'TRY_SEND') {
      engine.log(EVENT_TYPES.PACKET_SENT, engine.currentTime, currentPacket, `Packet ${currentPacket} (seq ${seqNum}) sent`);
      engine.stats.packetsSent++;

      // Start the timeout timer for this specific packet
      engine.scheduleEvent(engine.currentTime + timeout, 'TIMEOUT', { packet: currentPacket });

      // Simulate network unreliability: Does the packet get lost?
      if (engine.checkProbability(packetLoss)) {
        engine.stats.lostPackets++;
        engine.log(EVENT_TYPES.PACKET_LOST, engine.currentTime + transDelay / 2, currentPacket, `Packet ${currentPacket} lost in transit`);
      } else {
        // If not lost, schedule its arrival at the receiver after the transmission delay
        engine.scheduleEvent(engine.currentTime + transDelay, 'PACKET_ARRIVE', { packet: currentPacket });
      }
    } 
    else if (current.type === 'PACKET_ARRIVE') {
      const packet = current.data.packet;

      if (packet === currentPacket) {
        // If it's the packet we are expecting, it is a new successful delivery!
        if (!engine.stats.receiverAcked) engine.stats.receiverAcked = {};
        if (!engine.stats.receiverAcked[packet]) {
           engine.stats.packetsReceived++;
           engine.stats.receiverAcked[packet] = true;
           engine.log(EVENT_TYPES.PACKET_RECEIVED, engine.currentTime, packet, `Packet ${packet} received`);
        } else {
           engine.log(EVENT_TYPES.DISCARDED, engine.currentTime, packet, `Duplicate Packet ${packet} received`);
        }
      } else {
        // If it's an old delayed packet, ignore it
        continue; 
      }

      // Receiver always sends an ACK for a successfully received packet
      engine.log(EVENT_TYPES.ACK_SENT, engine.currentTime, currentPacket, `ACK ${seqNum} sent`);
      engine.stats.acksSent++;

      // Simulate network unreliability: Does the ACK get lost on the way back?
      if (engine.checkProbability(ackLoss)) {
        engine.stats.lostAcks++;
        engine.log(EVENT_TYPES.ACK_LOST, engine.currentTime + transDelay / 2, currentPacket, `ACK ${seqNum} lost`);
      } else {
        engine.scheduleEvent(engine.currentTime + transDelay, 'ACK_ARRIVE', { packet: currentPacket });
      }
    }
    else if (current.type === 'ACK_ARRIVE') {
      // Sender Logic: If this is an old delayed ACK, ignore it
      if (current.data.packet !== currentPacket) continue; 

      engine.stats.acksReceived++;
      engine.log(EVENT_TYPES.ACK_RECEIVED, engine.currentTime, currentPacket, `ACK ${seqNum} received`);

      // SUCCESS! The packet is confirmed delivered.
      // Move to the next packet and trigger a new send event.
      currentPacket++;
      engine.log(EVENT_TYPES.WINDOW_MOVED, engine.currentTime, currentPacket, `Window moved to ${currentPacket}`);
      
      engine.scheduleEvent(engine.currentTime, 'TRY_SEND', {});
    }
    else if (current.type === 'TIMEOUT') {
      // Sender Logic: The timer expired before we got an ACK.
      if (current.data.packet !== currentPacket) continue; // Ignore if we already moved on

      engine.stats.timeouts++;
      engine.log(EVENT_TYPES.TIMEOUT, engine.currentTime, currentPacket, `Timeout for Packet ${currentPacket}`);

      engine.stats.retransmissions++;
      engine.log(EVENT_TYPES.RETRANSMISSION, engine.currentTime, currentPacket, `Retransmitting Packet ${currentPacket}`);
      
      // Retransmit the packet
      engine.stats.packetsSent++;
      
      // Restart the timer for the retransmission
      engine.scheduleEvent(engine.currentTime + timeout, 'TIMEOUT', { packet: currentPacket });

      // Reroll the network unreliability dice for the retransmission
      if (engine.checkProbability(packetLoss)) {
        engine.stats.lostPackets++;
        engine.log(EVENT_TYPES.PACKET_LOST, engine.currentTime + transDelay / 2, currentPacket, `Packet ${currentPacket} lost in transit`);
      } else {
        engine.scheduleEvent(engine.currentTime + transDelay, 'PACKET_ARRIVE', { packet: currentPacket });
      }
    }
  }

  engine.stats.totalTime = Math.round(engine.currentTime);
  return { events: engine.events, stats: engine.stats };
}
