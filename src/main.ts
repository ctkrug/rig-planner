const app = document.querySelector<HTMLDivElement>("#app");

if (app) {
  app.innerHTML = `
    <main class="scaffold">
      <h1>Rig Planner</h1>
      <p>Scaffold stage — the rig input, solver, and results UI land in BUILD.</p>
    </main>
  `;
}
