import DefaultTheme from 'vitepress/theme'
import TestComp from '../components/TestComp.vue'
import './custom.css'

/** @type {import('vitepress').Theme} */
export default {
  extends: DefaultTheme,
  enhanceApp({ app }) {
    // register your custom global components
    app.component('TestComp', TestComp)
  }
}