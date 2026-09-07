import type { Metadata } from 'next';
import './globals.css';
export const metadata:Metadata={title:'An Afternoon Uptown — Jingheng Huan',description:'A little room for work, records, films, books, and life in New York.',metadataBase:new URL('https://jingheng-afternoon-uptown.jh730493450.chatgpt.site')};
export default function RootLayout({children}:{children:React.ReactNode}){return <html lang="en"><body>{children}</body></html>}
