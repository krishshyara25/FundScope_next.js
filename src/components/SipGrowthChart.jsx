'use client';

import { Card, CardContent, Typography, Box } from '@mui/material';
import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, Tooltip, Legend, CartesianGrid, Area, AreaChart } from 'recharts';

/**
 * SipGrowthChart
 * Visualizes SIP progression: cumulative invested vs market value, plus NAV line.
 * Props:
 *  - sipData: [{ date, invested, value, nav }]
 *  - totalInvested
 *  - futureValue (currentValue)
 *  - sipAmount
 */
export default function SipGrowthChart({ sipData = [], totalInvested, futureValue, sipAmount }) {
  if (!sipData.length) {
    return null;
  }

  // Prepare data (ensure chronological order)
  const data = [...sipData].sort((a,b) => new Date(a.date) - new Date(b.date));

  return (
    <Card sx={{ background: 'linear-gradient(135deg, rgba(16, 185, 129, 0.06) 0%, rgba(255,255,255,1) 100%)' }}>
      <CardContent sx={{ p: 3 }}>
        <Typography variant="h6" sx={{ fontWeight: 600, mb: 1 }}>SIP Growth Trajectory</Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
          Tracks cumulative invested capital vs market value using actual NAV on each investment date.
        </Typography>
        <Box sx={{ width: '100%', height: 320 }}>
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={data} margin={{ top: 10, right: 30, left: 0, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" strokeOpacity={0.25} />
              <XAxis dataKey="date" minTickGap={28} tick={{ fontSize: 11 }} />
              <YAxis tick={{ fontSize: 11 }} domain={[ 'auto', 'auto' ]} />
              <Tooltip formatter={(v, n) => [typeof v === 'number' ? v.toFixed(2) : v, n]} />
              <Legend />
              <Line type="monotone" dataKey="invested" stroke="#6366f1" strokeWidth={2} dot={false} name="Invested" />
              <Line type="monotone" dataKey="value" stroke="#10b981" strokeWidth={2} dot={false} name="Current Value" />
            </LineChart>
          </ResponsiveContainer>
        </Box>
        <Box sx={{ mt: 2, display: 'flex', flexWrap: 'wrap', gap: 4 }}>
          <Box>
            <Typography variant="caption" color="text.secondary">Total Invested</Typography>
            <Typography variant="body1" fontWeight={600}>₹{Math.round(totalInvested).toLocaleString('en-IN')}</Typography>
          </Box>
            <Box>
            <Typography variant="caption" color="text.secondary">Current Value</Typography>
            <Typography variant="body1" fontWeight={600}>₹{Math.round(futureValue).toLocaleString('en-IN')}</Typography>
          </Box>
          <Box>
            <Typography variant="caption" color="text.secondary">Installment</Typography>
            <Typography variant="body1" fontWeight={600}>₹{Math.round(sipAmount).toLocaleString('en-IN')}</Typography>
          </Box>
          <Box>
            <Typography variant="caption" color="text.secondary">Contributions</Typography>
            <Typography variant="body1" fontWeight={600}>{data.length} installments</Typography>
          </Box>
        </Box>
      </CardContent>
    </Card>
  );
}
