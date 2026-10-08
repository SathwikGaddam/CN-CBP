import { runStopAndWaitSimulation } from './src/protocols/stopAndWait.js';
import { runGoBackNSimulation } from './src/protocols/goBackN.js';
import { runSelectiveRepeatSimulation } from './src/protocols/selectiveRepeat.js';

const config = {
  numPackets: 10,
  windowSize: 4,
  packetLoss: 30,
  ackLoss: 30,
  transDelay: 1000,
  timeout: 2500
};

console.log(runStopAndWaitSimulation(config).stats);
console.log(runGoBackNSimulation(config).stats);
console.log(runSelectiveRepeatSimulation(config).stats);
