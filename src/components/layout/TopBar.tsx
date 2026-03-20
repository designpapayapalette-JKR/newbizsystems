"use client";
import Link from "next/link";
import { Bell, Settings } from "lucide-react";
import { Button } from "@/components/ui/button";

interface TopBarProps {
  title: string;
  subtitle?: string;
  actions?: React.ReactNode;
}

export function TopBar({ title, subtitle, actions }: TopBarProps) {
  return (
    <header className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 px-6 md:px-8 py-5 border-b bg-background/80 backdrop-blur-md sticky top-0 z-30">
      <div>
        <h1 className="text-xl md:text-2xl font-bold tracking-tight text-foreground">{title}</h1>
        {subtitle && <p className="text-sm text-muted-foreground mt-0.5">{subtitle}</p>}
      </div>
      <div className="flex items-center gap-2">
        {actions}
        <Link href="/CRM/reminders">
          <Button variant="ghost" size="icon">
            <Bell className="h-4 w-4" />
          </Button>
        </Link>
        <Link href="/CRM/settings/profile" className="md:hidden">
          <Button variant="ghost" size="icon">
            <Settings className="h-4 w-4" />
          </Button>
        </Link>
      </div>
    </header>
  );
}
