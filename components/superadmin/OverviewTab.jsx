import React from 'react';
import { Building2, Users, Shield, UserCheck, UserX, MapPin, FileText } from 'lucide-react';
import { format } from 'date-fns';

const OverviewTab = ({ stats, activityReports, leaveApplications }) => {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
        {[
          { icon: Building2, label: 'Total Branches', value: stats.totalBranches, color: 'blue' },
          { icon: Shield, label: 'Branch Admins', value: stats.totalAdmins, color: 'purple' },
          { icon: Users, label: 'Total Employees', value: stats.totalEmployees, color: 'green' },
          { icon: UserCheck, label: 'Active Users', value: stats.activeUsers, color: 'orange' },
          { icon: UserX, label: 'Unallocated', value: stats.unallocatedEmployees, color: 'red' },
        ].map(({ icon: Icon, label, value, color }) => (
          <div key={label} className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 transition-transform hover:scale-105">
            <div className="flex items-center">
              <div className={`p-2 bg-${color}-100 rounded-lg mr-4`}>
                <Icon className={`h-6 w-6 text-${color}-600`} />
              </div>
              <div>
                <p className={`text-2xl font-semibold text-${color}-600`}>{value}</p>
                <p className="text-sm text-gray-600">{label}</p>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">Recent Activity</h3>
          <div className="space-y-3">
            {activityReports.slice(0, 5).map((activity) => (
              <div key={activity.activity_id} className="flex items-center justify-between text-sm">
                <div className="flex items-center">
                  <MapPin className="h-4 w-4 text-gray-400 mr-2" />
                  <span>{activity.full_name} - {activity.customer_name}</span>
                </div>
                <span className="text-gray-500">{format(new Date(activity.activity_datetime), 'PPp')}</span>
              </div>
            ))}
          </div>
        </div>
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">Pending Leaves</h3>
          <div className="space-y-3">
            {leaveApplications.filter(leave => leave.status === 'PENDING').slice(0, 5).map((leave) => (
              <div key={leave.leave_id} className="flex items-center justify-between text-sm">
                <div className="flex items-center">
                  <FileText className="h-4 w-4 text-gray-400 mr-2" />
                  <span>{leave.full_name} - {leave.leave_type}</span>
                </div>
                <span className="text-gray-500">{format(new Date(leave.start_date), 'PP')} to {format(new Date(leave.end_date), 'PP')}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default OverviewTab;