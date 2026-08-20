import { ScrollViewStyleReset } from 'expo-router/html';
import { type PropsWithChildren } from 'react';

/**
 * This file is web-only and used to configure the root HTML structure for Expo Router Web.
 */
export default function RootHTML({ children }: PropsWithChildren) {
  return (
    <html lang="en">
      <head>
        <meta charSet="utf-8" />
        <meta httpEquiv="X-UA-Compatible" content="IE=edge" />
        <meta name="viewport" content="width=device-width, initial-scale=1, shrink-to-fit=no" />
        
        {/* SEO Metadata */}
        <title>Smart College Events - Event Management Platform</title>
        <meta name="description" content="A state-of-the-art college event management platform featuring real-time registrations, digital QR passes, interactive analytics, and event tracking." />
        <meta name="keywords" content="College Events, Event Management, Hackathon, Cultural Fest, Student Portal, Campus Events" />
        <meta name="theme-color" content="#4F46E5" />

        {/* OpenGraph Metadata */}
        <meta property="og:title" content="Smart College Events Platform" />
        <meta property="og:description" content="Discover, register, and manage campus events with instant QR passes and interactive analytics." />
        <meta property="og:type" content="website" />

        {/* Google Fonts - Inter & Outfit */}
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800;900&family=Outfit:wght@500;600;700;800;900&display=swap" rel="stylesheet" />

        <ScrollViewStyleReset />

        {/* Global Web Styling */}
        <style dangerouslySetInnerHTML={{ __html: `
          body {
            font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            background-color: #0f172a;
            color: #f8fafc;
            margin: 0;
            padding: 0;
            overflow-x: hidden;
            -webkit-font-smoothing: antialiased;
          }
          ::selection {
            background-color: #6366f1;
            color: #ffffff;
          }
          ::-webkit-scrollbar {
            width: 8px;
            height: 8px;
          }
          ::-webkit-scrollbar-track {
            background: #0f172a;
          }
          ::-webkit-scrollbar-thumb {
            background: #334155;
            border-radius: 4px;
          }
          ::-webkit-scrollbar-thumb:hover {
            background: #6366f1;
          }
        ` }} />
      </head>
      <body>{children}</body>
    </html>
  );
}
