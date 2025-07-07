// Simple icon creation script - run in browser console
function createSimpleIcon(size) {
    const canvas = document.createElement('canvas');
    canvas.width = size;
    canvas.height = size;
    const ctx = canvas.getContext('2d');
    
    // Background gradient
    const gradient = ctx.createLinearGradient(0, 0, size, size);
    gradient.addColorStop(0, '#667eea');
    gradient.addColorStop(1, '#764ba2');
    
    // Draw rounded rectangle
    const radius = size * 0.2;
    ctx.fillStyle = gradient;
    ctx.beginPath();
    ctx.roundRect(0, 0, size, size, radius);
    ctx.fill();
    
    // Draw grid pattern in white
    ctx.fillStyle = 'white';
    const block = size * 0.1;
    const margin = size * 0.2;
    
    // Grid blocks
    ctx.fillRect(margin, margin, block * 2, block * 1.5);
    ctx.fillRect(margin + block * 3, margin, block * 2, block);
    ctx.fillRect(margin, margin + block * 2.5, block * 2, block * 1.5);
    ctx.fillRect(margin + block * 3, margin + block * 1.5, block * 2, block * 2.5);
    
    return canvas.toDataURL();
}

// Add roundRect polyfill if needed
if (!CanvasRenderingContext2D.prototype.roundRect) {
    CanvasRenderingContext2D.prototype.roundRect = function (x, y, w, h, r) {
        if (w < 2 * r) r = w / 2;
        if (h < 2 * r) r = h / 2;
        this.beginPath();
        this.moveTo(x + r, y);
        this.arcTo(x + w, y, x + w, y + h, r);
        this.arcTo(x + w, y + h, x, y + h, r);
        this.arcTo(x, y + h, x, y, r);
        this.arcTo(x, y, x + w, y, r);
        this.closePath();
        return this;
    };
}

// Generate and download icons
[16, 32, 48, 128].forEach(size => {
    const dataUrl = createSimpleIcon(size);
    const link = document.createElement('a');
    link.download = `icon-${size}.png`;
    link.href = dataUrl;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
});

console.log('Icons generated and downloaded!');