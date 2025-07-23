import React from 'react';

export const themeColor = "#000000";
export const viewport = "width=device-width, initial-scale=1, maximum-scale=1";

export default function AnimationDemoLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-background">
      <div className="flex flex-col min-h-screen">
        <header className="border-b">
          <div className="container mx-auto py-4">
            <h1 className="text-2xl font-bold">Animation System Demo</h1>
          </div>
        </header>
        <main className="flex-1">
          {children}
        </main>
        <footer className="border-t">
          <div className="container mx-auto py-4 text-center text-sm text-muted-foreground">
            Animation and Transition System - Connectus
          </div>
        </footer>
      </div>
    </div>
  );
}