<script setup lang="ts">
import { nextTick, onMounted, ref } from 'vue';

const route = ref(location.hash.slice(1) || '/dashboard');
const name = ref('initial');
const notes = ref('initial notes');
const enabled = ref(false);
const choice = ref('alpha');
const theme = ref('light');
const dialog = ref<HTMLDialogElement>();

const drawCanvas = () => {
  const readable = document.querySelector<HTMLCanvasElement>('#readable-canvas');
  if (readable) {
    const context = readable.getContext('2d');
    if (context) {
      context.fillStyle = '#3366ff';
      context.fillRect(0, 0, readable.width, readable.height);
    }
  }
  const unreadable = document.querySelector<HTMLCanvasElement>('#unreadable-canvas');
  if (unreadable) unreadable.toDataURL = () => { throw new DOMException('tainted', 'SecurityError'); };
};

window.addEventListener('hashchange', () => {
  route.value = location.hash.slice(1) || '/dashboard';
  void nextTick(drawCanvas);
});

const openDialog = async () => {
  await nextTick();
  dialog.value?.showModal();
};

onMounted(() => {
  drawCanvas();
  const shadowHost = document.querySelector<HTMLElement>('#shadow-host');
  if (shadowHost) shadowHost.attachShadow({ mode: 'open' }).innerHTML = '<strong>shadow value</strong>';
});
</script>

<template>
  <main :class="['app', 'theme-' + theme]" data-testid="app-root">
    <nav>
      <a href="#/dashboard">Dashboard</a>
      <a href="#/users">Users</a>
      <a href="#/preferences">Preferences</a>
    </nav>
    <h1>{{ route }}</h1>
    <section v-if="route === '/dashboard'" data-testid="dashboard">
      <p>Dashboard statistics ready</p>
      <canvas id="readable-canvas" width="120" height="40" />
      <canvas id="unreadable-canvas" width="120" height="40" />
    </section>
    <section v-else-if="route === '/users'" data-testid="users">
      <label>Name <input id="name" v-model="name"></label>
      <label>Notes <textarea id="notes" v-model="notes" /></label>
      <label>Enabled <input id="enabled" v-model="enabled" type="checkbox"></label>
      <label>Choice
        <select id="choice" v-model="choice">
          <option value="alpha">Alpha</option>
          <option value="beta">Beta</option>
        </select>
      </label>
      <label>Password <input id="password" type="password" value="fixture-secret"></label>
      <label>File <input id="file" type="file"></label>
      <div id="editable" contenteditable="true">editable initial</div>
      <details id="details"><summary>Details</summary><p>Expanded content</p></details>
      <button id="open-dialog" @click="openDialog">Open dialog</button>
      <dialog id="edit-dialog" ref="dialog">
        <label>Dialog value <input id="dialog-value" value="draft"></label>
        <button @click="dialog?.close()">Close</button>
      </dialog>
    </section>
    <section v-else data-testid="preferences">
      <button id="theme-toggle" @click="theme = theme === 'light' ? 'dark' : 'light'">Toggle theme</button>
      <p id="theme-value">{{ theme }}</p>
    </section>
    <div id="scroll-box"><div class="scroll-content">Scrollable content</div></div>
    <div id="shadow-host" />
    <iframe title="fixture frame" srcdoc="<p>iframe content</p>" />
  </main>
</template>
