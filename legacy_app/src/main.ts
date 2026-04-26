import { mount } from 'svelte'
import './app.css'
import Entry from './Entry.svelte'

const app = mount(Entry, {
  target: document.getElementById('app')!,
})

export default app
