// BrickGrid class handles grid logic, drawing, and placement
class BrickGrid {
    constructor(canvas, spacing = 30, minSpacing = 10, maxSpacing = 200) {
        this.canvas = canvas;
        this.ctx = canvas.getContext('2d');
        this.spacing = spacing;
        this.minSpacing = minSpacing;
        this.maxSpacing = maxSpacing;
        // Offset for panning the grid
        this.offsetX = 0;
        this.offsetY = 0;
    }

    resize() {
        this.canvas.width = window.innerWidth;
        this.canvas.height = window.innerHeight;
    }

    setSpacing(newSpacing) {
        this.spacing = Math.max(this.minSpacing, Math.min(this.maxSpacing, newSpacing));
    }

    setOffset(dx, dy) {
        this.offsetX += dx;
        this.offsetY += dy;
    }

    getBrickCenter(mx, my) {
        let row = Math.floor(my / this.spacing);
        let col;
        if (row % 2 === 0) {
            col = Math.floor(mx / this.spacing);
        } else {
            col = Math.floor((mx - this.spacing / 2) / this.spacing);
        }
        let x = col * this.spacing + this.spacing / 2;
        if (row % 2 !== 0) x += this.spacing / 2;
        let y = row * this.spacing + this.spacing / 2;
        return {
            x: Math.max(this.spacing/2, Math.min(this.canvas.width - this.spacing/2, x)),
            y: Math.max(this.spacing/2, Math.min(this.canvas.height - this.spacing/2, y))
        };
    }

    getAllCenters() {
        let centers = [];
        for (let y = 0; y + this.spacing <= this.canvas.height; y += this.spacing) {
            let row = Math.floor(y / this.spacing);
            for (let x = 0; x + this.spacing <= this.canvas.width; x += this.spacing) {
                let cx = x + this.spacing / 2;
                if (row % 2 !== 0) cx += this.spacing / 2;
                centers.push({x: cx, y: y + this.spacing / 2});
            }
        }
        return centers;
   }

    // Convert logical (row, col) to pixel center for brick wall grid
    logicalToPixel(row, col) {
        let y = row * this.spacing + this.spacing / 2 + this.offsetY;
        let x = col * this.spacing + this.spacing / 2 + this.offsetX;
        if (row % 2 !== 0) x += this.spacing / 2;
        return {x, y};
    }

    // Convert pixel position to logical position for equilateral triangle placement
    pixelToLogical(x, y) {
        let row = Math.round((y - this.spacing / 2 - this.offsetY) / this.spacing);
        let col;
        if (row % 2 === 0) {
            col = Math.round((x - this.spacing / 2 - this.offsetX) / this.spacing);
        } else {
            col = Math.round((x - this.spacing - this.offsetX) / this.spacing);
        }
        return {row, col};
    }

    drawGrid() {
        // Draw brick wall grid
        this.ctx.fillStyle = '#000';
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
        this.ctx.strokeStyle = '#888';
        this.ctx.lineWidth = 1;
        for (let y = 0; y + this.spacing <= this.canvas.height; y += this.spacing) {
            let row = Math.floor(y / this.spacing);
            for (let x = 0; x + this.spacing <= this.canvas.width; x += this.spacing) {
                let x1 = x + this.offsetX;
                let x2 = x + this.spacing + this.offsetX;
                let y1 = y + this.offsetY;
                let y2 = y + this.spacing + this.offsetY;
                if (row % 2 !== 0) {
                    x1 += this.spacing / 2;
                    x2 += this.spacing / 2;
                }
                // Top and bottom
                this.ctx.beginPath();
                this.ctx.moveTo(x1, y1);
                this.ctx.lineTo(x2, y1);
                this.ctx.stroke();
                this.ctx.beginPath();
                this.ctx.moveTo(x1, y2);
                this.ctx.lineTo(x2, y2);
                this.ctx.stroke();
                // Left and right
                this.ctx.beginPath();
                this.ctx.moveTo(x1, y1);
                this.ctx.lineTo(x1, y2);
                this.ctx.stroke();
                this.ctx.beginPath();
                this.ctx.moveTo(x2, y1);
                this.ctx.lineTo(x2, y2);
                this.ctx.stroke();
            }
        }
        // Draw dots at brick wall centers
        this.ctx.fillStyle = '#0078d4';
        for (let y = 0; y + this.spacing <= this.canvas.height; y += this.spacing) {
            let row = Math.floor(y / this.spacing);
            for (let x = 0; x + this.spacing <= this.canvas.width; x += this.spacing) {
                let cx = x + this.spacing / 2 + this.offsetX;
                let cy = y + this.spacing / 2 + this.offsetY;
                if (row % 2 !== 0) cx += this.spacing / 2;
                this.ctx.beginPath();
                this.ctx.arc(cx, cy, 3, 0, Math.PI * 2);
                this.ctx.fill();
            }
        }
    }
}

export { BrickGrid };
