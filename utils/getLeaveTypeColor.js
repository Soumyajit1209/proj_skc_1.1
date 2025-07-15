export const getLeaveTypeColor = (type) => {
  switch (type) {
    case 'Casual Leave':
      return 'bg-blue-100 text-blue-800 border-blue-200';
    case 'Sick Leave':
      return 'bg-orange-100 text-orange-800 border-orange-200';
    case 'Annual Leave':
      return 'bg-purple-100 text-purple-800 border-purple-200';
    case 'Maternity Leave':
      return 'bg-pink-100 text-pink-800 border-pink-200';
    case 'Emergency Leave':
      return 'bg-red-100 text-red-800 border-red-200';
    default:
      return 'bg-gray-100 text-gray-800 border-gray-200';
  }
};