// CircleManager class handles circle logic, placement, movement, and drawing
// Now stores logical grid positions (row, col) for each circle
class CircleManager {
    constructor(grid) {
        this.grid = grid;
        this.circles = [];
        this.selectedCircle = null;
        this.selectedCircles = new Set(); // multiselect
        this.dragging = false;
        this.dragOffset = {x: 0, y: 0};
    }

    // Convert logical position to pixel position
    logicalToPixel(row, col) {
        let y = row * this.grid.spacing + this.grid.spacing / 2;
        let x = col * this.grid.spacing + this.grid.spacing / 2;
        if (row % 2 !== 0) x += this.grid.spacing / 2;
        return {x, y};
    }

    // Convert pixel position to logical position
    pixelToLogical(mx, my) {
        let row = Math.floor(my / this.grid.spacing);
        let col;
        if (row % 2 === 0) {
            col = Math.floor(mx / this.grid.spacing);
        } else {
            col = Math.floor((mx - this.grid.spacing / 2) / this.grid.spacing);
        }
        return {row, col};
    }

    spawnRandomCircle() {
        const centers = this.grid.getAllCenters();
        if (centers.length > 0) {
            const idx = Math.floor(Math.random() * centers.length);
            const center = centers[idx];
            const logical = this.pixelToLogical(center.x, center.y);
            this.circles.push({row: logical.row, col: logical.col});
            this.selectedCircle = this.circles.length - 1;
        }
    }

    selectCircle(mx, my, multiselect = false) {
        let found = false;
        this.circles.forEach((c, i) => {
            const pos = this.logicalToPixel(c.row, c.col);
            const dist = Math.hypot(mx - pos.x, my - pos.y);
            if (dist <= this.grid.spacing/2) {
                if (multiselect) {
                    if (this.selectedCircles.has(i)) {
                        this.selectedCircles.delete(i);
                    } else {
                        this.selectedCircles.add(i);
                    }
                } else {
                    this.selectedCircle = i;
                    this.selectedCircles.clear();
                    this.selectedCircles.add(i);
                }
                this.dragging = !multiselect;
                this.dragOffset.x = mx - pos.x;
                this.dragOffset.y = my - pos.y;
                found = true;
            }
        });
        if (!found && !multiselect) {
            this.selectedCircle = null;
            this.selectedCircles.clear();
        }
    }

    dragCircle(mx, my, index = null) {
        if (this.dragging) {
            if (index !== null) {
                const c = this.circles[index];
                c._dragX = mx - this.dragOffset.x;
                c._dragY = my - this.dragOffset.y;
            } else if (this.selectedCircle !== null) {
                const c = this.circles[this.selectedCircle];
                c._dragX = mx - this.dragOffset.x;
                c._dragY = my - this.dragOffset.y;
            }
        }
    }

    // Accept a callback to run when a circle is moved
    dropCircle(mx, my, onMove, index = null) {
        if (this.dragging) {
            if (index !== null) {
                const logical = this.pixelToLogical(mx - this.dragOffset.x, my - this.dragOffset.y);
                const c = this.circles[index];
                const moved = c.row !== logical.row || c.col !== logical.col;
                c.row = logical.row;
                c.col = logical.col;
                if (moved) c.moved = true;
                delete c._dragX;
                delete c._dragY;
                if (moved && onMove) onMove();
            } else if (this.selectedCircle !== null) {
                const logical = this.pixelToLogical(mx - this.dragOffset.x, my - this.dragOffset.y);
                const c = this.circles[this.selectedCircle];
                const moved = c.row !== logical.row || c.col !== logical.col;
                c.row = logical.row;
                c.col = logical.col;
                if (moved) c.moved = true;
                delete c._dragX;
                delete c._dragY;
                if (moved && onMove) onMove();
            }
            this.dragging = false;
        }
    }

    // Accept a callback to run when a circle is moved
    moveSelectedCircle(dx, dy, onMove) {
        if (this.selectedCircle === null || this.circles.length === 0) return;
        let c = this.circles[this.selectedCircle];
        let pos = this.logicalToPixel(c.row, c.col);
        let mx = pos.x + dx;
        let my = pos.y + dy;
        const logical = this.pixelToLogical(mx, my);
        if (c.row !== logical.row || c.col !== logical.col) {
            c.row = logical.row;
            c.col = logical.col;
            c.moved = true;
            if (onMove) onMove();
        }
    }

    moveSelectedCircles(dx, dy, onMove) {
        if (this.selectedCircles.size === 0) return;
        this.selectedCircles.forEach(i => {
            let c = this.circles[i];
            let pos = this.logicalToPixel(c.row, c.col);
            let mx = pos.x + dx;
            let my = pos.y + dy;
            const logical = this.pixelToLogical(mx, my);
            if (c.row !== logical.row || c.col !== logical.col) {
                c.row = logical.row;
                c.col = logical.col;
                c.moved = true;
                if (onMove) onMove();
            }
        });
    }

    realignCircles() {
        // No need to change logical positions, just redraw
    }

    // Draw all circles using grid's logicalToPixel (with offset)
    drawCircles() {
        this.circles.forEach((c, i) => {
            let pos = c._dragX !== undefined ? {x: c._dragX, y: c._dragY} : this.grid.logicalToPixel(c.row, c.col);
            this.grid.ctx.beginPath();
            this.grid.ctx.arc(pos.x, pos.y, this.grid.spacing/2, 0, Math.PI * 2);
            if (c.moved) {
                this.grid.ctx.strokeStyle = '#ff69b4'; // pink
            } else if (this.selectedCircles.has(i)) {
                this.grid.ctx.strokeStyle = '#0ff'; // cyan for multiselect
            } else {
                this.grid.ctx.strokeStyle = (i === this.selectedCircle) ? '#ff0' : '#fff';
            }
            this.grid.ctx.lineWidth = (this.selectedCircles.has(i) ? 4 : (i === this.selectedCircle ? 4 : 2));
            this.grid.ctx.stroke();
        });
    }

    resetMoved() {
        this.circles.forEach(c => { c.moved = false; });
    }
}

export { CircleManager };
