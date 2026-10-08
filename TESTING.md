# ARQ Simulator: Final Testing Checklist

This document contains a comprehensive manual testing matrix designed to verify the mathematical integrity, visual stability, and algorithmic correctness of the ARQ Simulator prior to presentation.

## Core Protocol Behavior Tests

### ✅ Test 1: 0% Loss (Ideal Network)
**Configuration**: 10 Packets, 0% Packet Loss, 0% ACK Loss.
- [ ] **Stop-and-Wait**: Packets should fire strictly one at a time. No retransmissions. 100% Efficiency.
- [ ] **Go-Back-N**: Window slides forward perfectly. ACKs are cumulative. 100% Efficiency.
- [ ] **Selective Repeat**: Window slides forward perfectly. Individual ACKs match packets. 100% Efficiency.

### ✅ Test 2: 10% Loss (Light Congestion)
**Configuration**: 20 Packets, Window Size 5, 10% Packet Loss, 0% ACK Loss.
- [ ] **Stop-and-Wait**: Should occasionally timeout and retransmit *only* the single lost packet.
- [ ] **Go-Back-N**: Upon loss, receiver discards subsequent packets. After timeout, sender retransmits the full window from the point of loss. Delivery efficiency drops noticeably.
- [ ] **Selective Repeat**: Upon loss, receiver buffers subsequent packets. Sender times out and retransmits *only* the single lost packet. Receiver instantly delivers the buffered packets once the missing packet arrives.

### ✅ Test 3: 20% to 50% Loss (Heavy Congestion)
**Configuration**: 20 Packets, Window Size 5, 30% Packet Loss, 20% ACK Loss.
- [ ] **Stop-and-Wait**: Extremely slow. Heavy timeouts.
- [ ] **Go-Back-N**: Severe "retransmission storm". Efficiency should plummet below 50% as entire windows are needlessly retransmitted.
- [ ] **Selective Repeat**: Remains highly efficient despite loss. Retransmissions remain minimal compared to GBN.

---

## Edge Case Matrix

### ✅ Test 4: Maximum Boundaries
**Configuration**: 100 Packets, Window Size 20, 10% Packet Loss.
- [ ] Application does not freeze or lag.
- [ ] Network Visualizer scales and scrubs correctly without overflowing.
- [ ] Event Log chronologically sorts hundreds of events cleanly.

### ✅ Test 5: Infinite Loop Prevention (100% Loss)
**Configuration**: 10 Packets, Window Size 4, 100% Packet Loss, 100% ACK Loss.
- [ ] **Execution**: Click Start Simulation.
- [ ] **Verification**: The simulation engine's safety tripwire must trigger. A red `ERROR` event should appear in the Event Log stating "Excessive retransmissions detected". The browser must **not** freeze.

### ✅ Test 6: Window Size Degeneration
**Configuration**: 10 Packets, Window Size 1, 10% Loss.
- [ ] **Go-Back-N**: With a window size of 1, the sliding window logic should mathematically degenerate to behave identically to Stop-and-Wait.
- [ ] **Selective Repeat**: With a window size of 1, it should also behave identically to Stop-and-Wait.

### ✅ Test 7: Packets < Window Size
**Configuration**: 2 Packets, Window Size 10.
- [ ] Sender brackets should automatically constrain themselves to size 2.
- [ ] The simulation must successfully terminate after packet 1 and 2 are delivered without attempting to fire out-of-bounds array indices.

---

## UI / UX Validation

### ✅ Test 8: Protocol Comparison Engine
**Configuration**: 20 Packets, Window 5, 20% Packet Loss, 10% ACK Loss.
- [ ] Click the **Compare All** tab.
- [ ] Verify that the Recharts Bar Charts render successfully.
- [ ] **Validation**: Selective Repeat's Efficiency % must mathematically be greater than or equal to Go-Back-N's under loss conditions.
- [ ] **Validation**: Stop-and-Wait's Simulation Time must be significantly higher than the others.

### ✅ Test 9: Input Clamping
- [ ] Attempt to set Packets to `0` or `-5`. It should clamp to `1`.
- [ ] Attempt to set Window Size to `0`. It should clamp to `1`.
- [ ] Attempt to set Loss to `150%`. It should clamp to `100%`.

### ✅ Test 10: Asynchronous State
- [ ] Click "Start Simulation".
- [ ] Ensure the blue "Simulating Network Traffic..." CSS Spinner appears briefly before rendering the visualizer.
- [ ] Ensure there are zero React key warnings or `TypeError`s in the Developer Console (`F12`).
