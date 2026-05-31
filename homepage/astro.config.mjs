import { defineConfig } from 'astro/config';
import starlight from '@astrojs/starlight';

export default defineConfig({
  integrations: [
    starlight({
      title: 'scorehack',
      description: '作曲設計に特化したキーボード駆動の作曲支援アプリ',
      social: [
        {
          icon: 'github',
          label: 'GitHub',
          href: 'https://github.com/',
        },
      ],
      sidebar: [
        {
          label: 'Overview',
          items: [
            { label: 'scorehackとは', link: '/' },
            { label: '基本ワークフロー', link: '/overview/workflow/' },
            { label: '用語と全体像', link: '/overview/terms/' },
          ],
        },
        {
          label: 'Outline',
          items: [
            { label: '概要', link: '/outline/' },
            { label: 'Init', link: '/outline/init/' },
            { label: 'Section', link: '/outline/section/' },
            { label: 'Chord', link: '/outline/chord/' },
            { label: 'Event', link: '/outline/event/' },
          ],
        },
        {
          label: 'Melody',
          items: [
            { label: '概要', link: '/melody/' },
            { label: 'Cursor', link: '/melody/cursor/' },
            { label: 'Note', link: '/melody/note/' },
            { label: 'Selection', link: '/melody/selection/' },
            { label: 'Edit', link: '/melody/edit/' },
            { label: 'Pronunciation', link: '/melody/pronunciation/' },
            { label: 'Chord Assist', link: '/melody/chord-assist/' },
            { label: 'Playback', link: '/melody/playback/' },
          ],
        },
        {
          label: 'Arrange',
          items: [{ label: '概要', link: '/arrange/' }],
        },
        {
          label: 'Terminal',
          items: [{ label: 'ターミナル操作', link: '/terminal/' }],
        },
      ],
      customCss: ['./src/styles/starlight.css'],
    }),
  ],
});
