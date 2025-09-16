import { defineConfig } from 'vitepress'

export default defineConfig({
  title: 'MongoMod',
  description: 'A powerful MongoDB model-based library for Node.js with TypeScript support',
  head: [
    ['link', { rel: 'icon', href: '/favicon.ico' }]
  ],
  themeConfig: {
    logo: '/logo.png',
    nav: [
      { text: 'Guide', link: '/quick-start' },
      { text: 'API Reference', link: '/api-reference/' },
      { text: 'Examples', link: '/advanced-usage' },
    ],
    sidebar: {
      '/': [
        {
          text: 'Getting Started',
          items: [
            { text: 'Introduction', link: '/' },
            { text: 'Installation', link: '/installation' },
            { text: 'Quick Start', link: '/quick-start' }
          ]
        },
        {
          text: 'Core Components',
          items: [
            { text: 'MongoConnection', link: '/core-components/mongo-connection' },
            { text: 'MongoSchema', link: '/core-components/mongo-schema' },
            { text: 'MongoController', link: '/core-components/mongo-controller' },
            { text: 'MongoModel', link: '/core-components/mongo-model' },
            { text: 'MongoSubscriber', link: '/core-components/mongo-subscriber' }
          ]
        },
        {
          text: 'API Reference',
          items: [
            { text: 'Model Methods', link: '/api-reference/model-methods' },
            { text: 'Static Methods', link: '/api-reference/static-methods' },
            { text: 'Schema Validation', link: '/api-reference/schema-validation' },
            { text: 'Event System', link: '/api-reference/event-system' }
          ]
        },
        {
          text: 'Advanced',
          items: [
            { text: 'Advanced Usage', link: '/advanced-usage' },
            { text: 'Error Handling', link: '/error-handling' },
            { text: 'Migration Guide', link: '/migration-guide' }
          ]
        }
      ]
    },
    
    socialLinks: [
      { icon: 'github', link: 'https://github.com/lesha2r/mongomod' },
      { icon: 'npm', link: 'https://www.npmjs.com/package/mongomod' }
    ],
    
    search: {
      provider: 'local'
    },
    
    footer: {
      message: 'Released under the ISC License.',
      copyright: 'Copyright © 2025 lesha2r'
    },
    
    editLink: {
      pattern: 'https://github.com/lesha2r/mongomod/edit/main/docs/:path',
      text: 'Edit this page on GitHub'
    }
  },
  
  cleanUrls: true,
  lastUpdated: true
})