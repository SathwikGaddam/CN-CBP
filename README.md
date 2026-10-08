# Reliable Data Transfer & ARQ Simulator

## Problem Statement

In modern computer networks, the underlying physical links and packet-switching routers are inherently unreliable. Packets of data can be delayed, corrupted, or completely dropped due to network congestion or hardware failures. The fundamental problem of **Reliable Data Transfer** is how to build a reliable transport layer (like TCP) on top of an unreliable network layer (like IP), ensuring that all data is delivered completely, correctly, and in the right order.

## Objective

The objective of this project is to provide a highly interactive, visual, and mathematical simulator for **Automatic Repeat reQuest (ARQ)** protocols. This simulator is built for Computer Science and Engineering students to observe, benchmark, and understand the trade-offs of the three primary ARQ algorithms used to solve the reliable data transfer problem.

## Protocols

This application simulates three core ARQ protocols:

1. **Stop-and-Wait ARQ**: The simplest protocol. The sender transmits a single packet and strictly waits for an acknowledgment (ACK) before transmitting the next. While simple, it is highly inefficient over networks with high propagation delay.
2. **Go-Back-N ARQ**: Introduces a "Sliding Window" allowing the sender to transmit multiple packets without waiting for ACKs. It utilizes cumulative ACKs. If a packet is lost, the receiver discards all subsequent out-of-order packets, forcing the sender to retransmit the lost packet and all packets that followed it.
3. **Selective Repeat ARQ**: The most efficient ARQ protocol. Both the sender and receiver maintain sliding windows. The receiver individually acknowledges packets and buffers out-of-order packets. When a timeout occurs, the sender retransmits *only* the specific packet that was lost, saving immense network bandwidth.

## Features

- **Interactive Network Visualizer**: Frame-by-frame animation of packets and ACKs traveling across a simulated network link.
- **Dynamic Sliding Windows**: Visual brackets mapping the sender and receiver window bounds in real-time.
- **Protocol Comparison Engine**: Run all three protocols simultaneously under identical network conditions and view side-by-side metric comparisons.
- **Comprehensive Statistics**: Real-time tracking of Retransmissions, Timeouts, Lost Packets, and Mathematical Delivery Efficiency.
- **Chronological Event Log**: A color-coded, scrollable terminal detailing every packet transmission, ACK, drop, and window slide.
- **Adjustable Parameters**: Manually tweak Window Size, Packet Loss Probability, ACK Loss Probability, and Timeout durations.
- **Educational Dashboards**: Built-in study guides explaining the advantages, disadvantages, and typical use cases of each protocol.
- **Robust Edge-Case Handling**: Natively handles 100% loss rates safely with internal retry limiters.

## Tech Stack

- **React**: Component-based UI rendering.
- **JavaScript**: Pure Vanilla JS for the discrete-event simulation engine.
- **CSS**: Custom glassmorphism styling, CSS Grid/Flexbox, and keyframe animations.
- **Vite**: Ultra-fast frontend build tool and development server.
- **Recharts**: Data visualization library for protocol comparison bar charts.

## Installation

1. Navigate to the project directory:
   ```bash
   cd arq-simulator
   ```
2. Install the dependencies:
   ```bash
   npm install
   ```
3. Start the development server:
   ```bash
   npm run dev
   ```
4. Open your browser to the local URL provided (usually `http://localhost:5173`).

## How to Use

1. **Select a Protocol**: Click on the tabs at the top to select `Stop-and-Wait`, `Go-Back-N`, `Selective Repeat`, or `Compare All`.
2. **Configure the Network**: Use the sliders and inputs in the Control Panel to set the total number of packets, sliding window size, and loss probabilities.
3. **Run the Simulation**: Click the green **Start Simulation** button.
4. **Observe the Visualizer**: Watch the packets travel through the network. Notice how lost packets trigger timeouts and retransmissions based on the selected algorithm.
5. **Review the Data**: Scroll down to view the Event Log and the Statistics Dashboard to calculate your network's Delivery Efficiency.

## Architecture

The application strictly separates the UI logic from the mathematical networking algorithms using a **Discrete-Event Simulation** architecture:

```text
       [ UI / React Inputs ]
                 ↓
      [ Simulation Engine ]   <-- Manages Event Queue, Time, & Stats
                 ↓
    [ Protocol Algorithms ]   <-- Pure JS implementation of SW, GBN, SR
                 ↓
      [ Generated Events ]    <-- Array of chronologically stamped events
                 ↓
[ Visualization + Statistics ] <-- React renders the resulting timeline dynamically
```

## Future Enhancements

- **TCP Congestion-Control**: Implement Slow Start, Congestion Avoidance, and Fast Retransmit.
- **Network Latency Visualization**: Visualize variable propagation delays and jitter.
- **Real Packet Capture Integration**: Import `.pcap` files from Wireshark for visual playback.
- **Backend-Based Multi-User Simulation**: Implement WebSockets to allow two distinct browser instances to act as the Sender and Receiver over a real network.
- **More Network Protocols**: Support for UDP streams and routing algorithms (Dijkstra/Bellman-Ford).
