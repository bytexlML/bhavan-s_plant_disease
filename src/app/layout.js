import './globals.css';

export const metadata = {
  title: "Bhavan's AI Plant Health System",
  description: 'Professional Botanical Health & Disease Analysis',
}

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  )
}
