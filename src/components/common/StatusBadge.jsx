import React from 'react';

const colors = { 
    pending: 'bg-amber-50 text-amber-800', 
    approved: 'bg-green-50 text-green-800', 
    rejected: 'bg-red-50 text-red-800' 
};

export const StatusBadge = ({ status }) => {
    const statusKey = status ? status.toLowerCase() : '';
    const colorClass = colors[statusKey] || 'bg-gray-100 text-gray-800';
    return (
        <span className={`${colorClass} text-xs font-medium px-2.5 py-0.5 rounded-full`} style={{ textTransform: 'capitalize' }}>
            {status}
        </span>
    );
};

export default StatusBadge;
