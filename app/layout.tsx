import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  metadataBase: new URL('https://egolife-research-atlas.rikliuzhaodong.chatgpt.site'),
  title: 'EgoLife Research Atlas｜长时多模态记忆数据集调研',
  description: '系统比较 EgoLife、CASTLE、EgoMonth、HD-EPIC、TeleEgo 等第一视角、多模态和长期记忆数据集。',
  icons: { icon: '/favicon.svg' },
  openGraph: { title: 'EgoLife Research Atlas', description: 'EgoLife 数据集、研究团队与长时多模态记忆数据版图', type: 'website', locale: 'zh_CN', images: [{ url: '/og.png', width: 1200, height: 630, alt: 'EgoLife Research Atlas — 长时多模态记忆数据版图' }] },
  twitter: { card: 'summary_large_image', title: 'EgoLife Research Atlas', description: '长时多模态记忆数据版图', images: ['/og.png'] },
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="zh-CN"><body>{children}</body></html>;
}
