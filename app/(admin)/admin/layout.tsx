import React from 'react';
import { Metadata } from 'next';
import { AdminShell } from '@/components/admin/admin-shell';

export const metadata: Metadata = {
  title: 'Owner Dashboard | Alishan Furnitures',
  description: 'Management portal for Alishan Furnitures showroom owner.',
};

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <AdminShell>{children}</AdminShell>;
}
