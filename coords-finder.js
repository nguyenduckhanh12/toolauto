document.querySelector('canvas').addEventListener('click', function(e) {
    const rect = this.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    console.log(`Click Canvas at: X=${x}, Y=${y}`);
  });