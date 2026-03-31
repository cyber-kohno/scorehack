declare module '*.svelte' {
  import type { SvelteComponentTyped } from 'svelte';
  
  const component: SvelteComponentTyped<any, any, any>; // ここを変更
  export default component;
}