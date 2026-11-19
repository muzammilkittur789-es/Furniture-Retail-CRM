import React from 'react';
import { getAllStaffMembers } from '@/lib/store/showroom-store';
import { StaffCredentialsClient } from '@/components/admin/staff-credentials-client';

export const dynamic = 'force-dynamic';

export default async function AdminStaffPage() {
  const staffList = getAllStaffMembers();

  return <StaffCredentialsClient initialStaff={staffList} />;
}
