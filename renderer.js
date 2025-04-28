const { ipcRenderer } = require('electron');

window.addEventListener('DOMContentLoaded', () => {
  const startBtn = document.getElementById('start-button');
  const exportBtn = document.getElementById('export-button');

  startBtn.addEventListener('click', () => {
    console.log('Start clicked');
    ipcRenderer.send('start-auto');
  });

  exportBtn.addEventListener('click', () => {
    console.log('Export clicked');
    ipcRenderer.send('export-csv');
  });
});
