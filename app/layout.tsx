import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Class Student Automation",
  description: "Student classwork automation dashboard for schedules, assignments, documents, and reminders.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en" className="h-full antialiased">
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}
