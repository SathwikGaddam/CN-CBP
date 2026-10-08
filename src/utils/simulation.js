export const EVENT_TYPES = {
  PACKET_SENT: 'PACKET_SENT',
  PACKET_RECEIVED: 'PACKET_RECEIVED',
  PACKET_LOST: 'PACKET_LOST',
  PACKET_CORRUPTED: 'PACKET_CORRUPTED',
  ACK_SENT: 'ACK_SENT',
  ACK_RECEIVED: 'ACK_RECEIVED',
  ACK_LOST: 'ACK_LOST',
  TIMEOUT: 'TIMEOUT',
  RETRANSMISSION: 'RETRANSMISSION',
  WINDOW_MOVED: 'WINDOW_MOVED',
  BUFFERED: 'BUFFERED',
  DISCARDED: 'DISCARDED',
  ERROR: 'ERROR'
};

export class SimulationEngine {
  constructor(config) {
    this.config = config;
    this.events = [];
    this.queue = [];
    this.stats = {
      packetsSent: 0,
      packetsReceived: 0,
      retransmissions: 0,
      timeouts: 0,
      acksSent: 0,
      acksReceived: 0,
      lostPackets: 0,
      lostAcks: 0,
      corruptedPackets: 0,
      totalTime: 0
    };
    this.currentTime = 0;
    this.iterations = 0;
    this.MAX_ITERATIONS = 20000;
  }

  scheduleEvent(time, type, data) {
    this.queue.push({ time, type, data });
    this.queue.sort((a, b) => a.time - b.time);
  }

  popEvent() {
    return this.queue.shift();
  }

  hasEvents() {
    return this.queue.length > 0;
  }

  log(type, time, packetSeq, message, extra = {}) {
    this.events.push({
      id: this.events.length,
      time: Math.round(time),
      type,
      packet: packetSeq,
      message,
      ...extra
    });
  }

  checkProbability(probability) {
    return Math.random() * 100 < probability;
  }

  incrementIterations() {
    this.iterations++;
    
    // Phase 13 Edge Case: Safety mechanism to prevent infinite loops on 100% loss
    const maxAllowedRetransmissions = Math.max(50, this.config.numPackets * 5);
    if (this.stats.retransmissions > maxAllowedRetransmissions) {
      this.log(EVENT_TYPES.ERROR, this.currentTime, -1, 'Simulation aborted: Excessive retransmissions detected (network link is effectively dead).');
      return false;
    }

    if (this.iterations >= this.MAX_ITERATIONS) {
      this.log(EVENT_TYPES.ERROR, this.currentTime, -1, 'Simulation reached max iterations! Aborted.');
      return false;
    }
    return true;
  }
}
