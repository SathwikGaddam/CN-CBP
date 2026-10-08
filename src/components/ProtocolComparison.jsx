import React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import './ProtocolComparison.css';

function ProtocolComparison({ data }) {
  if (!data) return null;

  const calculateEfficiency = (stats) => {
    return stats.packetsSent > 0 
      ? Number(((stats.packetsReceived / stats.packetsSent) * 100).toFixed(2))
      : 0;
  };

  const tableRows = [
    { label: 'Packets Sent', key: 'packetsSent' },
    { label: 'Packets Received', key: 'packetsReceived' },
    { label: 'Retransmissions', key: 'retransmissions' },
    { label: 'Timeouts', key: 'timeouts' },
    { label: 'ACKs Sent', key: 'acksSent' },
    { label: 'ACKs Received', key: 'acksReceived' },
    { label: 'Simulation Time (ms)', key: 'totalTime' }
  ];

  const chartData = [
    {
      name: 'Stop-and-Wait',
      PacketsSent: data.sw.packetsSent,
      Retransmissions: data.sw.retransmissions,
      Timeouts: data.sw.timeouts,
      Efficiency: calculateEfficiency(data.sw)
    },
    {
      name: 'Go-Back-N',
      PacketsSent: data.gbn.packetsSent,
      Retransmissions: data.gbn.retransmissions,
      Timeouts: data.gbn.timeouts,
      Efficiency: calculateEfficiency(data.gbn)
    },
    {
      name: 'Selective Repeat',
      PacketsSent: data.sr.packetsSent,
      Retransmissions: data.sr.retransmissions,
      Timeouts: data.sr.timeouts,
      Efficiency: calculateEfficiency(data.sr)
    }
  ];

  return (
    <div className="protocol-comparison">
      <h3>Protocol Comparison Results</h3>
      
      <div className="comparison-table-container glass-panel">
        <table className="comparison-table">
          <thead>
            <tr>
              <th>Metric</th>
              <th>Stop-and-Wait</th>
              <th>Go-Back-N</th>
              <th>Selective Repeat</th>
            </tr>
          </thead>
          <tbody>
            {tableRows.map(row => (
              <tr key={row.key}>
                <td>{row.label}</td>
                <td>{data.sw[row.key]}</td>
                <td>{data.gbn[row.key]}</td>
                <td>{data.sr[row.key]}</td>
              </tr>
            ))}
            <tr className="highlight-row">
              <td>Delivery Efficiency</td>
              <td>{calculateEfficiency(data.sw)}%</td>
              <td>{calculateEfficiency(data.gbn)}%</td>
              <td>{calculateEfficiency(data.sr)}%</td>
            </tr>
          </tbody>
        </table>
      </div>

      <div className="charts-grid">
        <div className="chart-card glass-panel">
          <h4>Packets & Retransmissions</h4>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
              <XAxis dataKey="name" stroke="#cbd5e1" />
              <YAxis stroke="#cbd5e1" />
              <Tooltip cursor={{fill: 'rgba(255,255,255,0.05)'}} contentStyle={{backgroundColor: '#1e293b', border: '1px solid rgba(255,255,255,0.1)', color: '#fff', borderRadius: '8px'}} />
              <Legend />
              <Bar dataKey="PacketsSent" fill="#3b82f6" name="Total Packets Sent" radius={[4, 4, 0, 0]} />
              <Bar dataKey="Retransmissions" fill="#f59e0b" name="Retransmissions" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="chart-card glass-panel">
          <h4>Timeouts vs Efficiency</h4>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
              <XAxis dataKey="name" stroke="#cbd5e1" />
              <YAxis yAxisId="left" stroke="#ef4444" />
              <YAxis yAxisId="right" orientation="right" stroke="#10b981" />
              <Tooltip cursor={{fill: 'rgba(255,255,255,0.05)'}} contentStyle={{backgroundColor: '#1e293b', border: '1px solid rgba(255,255,255,0.1)', color: '#fff', borderRadius: '8px'}} />
              <Legend />
              <Bar yAxisId="left" dataKey="Timeouts" fill="#ef4444" name="Timeouts" radius={[4, 4, 0, 0]} />
              <Bar yAxisId="right" dataKey="Efficiency" fill="#10b981" name="Efficiency (%)" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}

export default ProtocolComparison;
