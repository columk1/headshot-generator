'use client';

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="p-0 lg:p-4">
      {children}
    </div>
  );
}
