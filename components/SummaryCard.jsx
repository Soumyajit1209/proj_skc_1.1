import React from 'react';

const SummaryCard = ({ title, value, color }) => (
  <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
    <div className={`text-2xl font-bold ${color}`}>{value}</div>
    <div className="text-sm text-gray-600">{title}</div>
  </div>
);

export default SummaryCard;