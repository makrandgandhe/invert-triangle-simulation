// Main simulation logic for brick wall grid and draggable circles
// Uses BrickGrid and CircleManager classes
import { BrickGrid } from './brickGrid.js';
import { CircleManager } from './circleManager.js';
import { FloatingCounter } from './floatingCounter.js';
import { StructureFormation, TriangularStructure, InvertedTriangularStructure } from './structureFormation.js';

const canvas = document.getElementById('gridCanvas');
const grid = new BrickGrid(canvas);
const counter = new FloatingCounter(() => {
    formations.forEach(f => f.circleManager.resetMoved());
    drawAll();
});
let triangleFormation = null;
let formations = [];
let selectedFormation = null;
let multiDragActive = false;
let multiDragStart = null;
let multiDragOffsets = null;
let lastTouch = null;

function resizeCanvas() {
    grid.resize();
    formations.forEach(f => f.circleManager.realignCircles());
    drawAll();
}
window.addEventListener('resize', resizeCanvas);
resizeCanvas();

canvas.addEventListener('wheel', (e) => {
    e.preventDefault();
    const zoomFactor = e.deltaY < 0 ? 1.1 : 0.9;
    grid.setSpacing(grid.spacing * zoomFactor);
    formations.forEach(f => f.circleManager.realignCircles());
    drawAll();
});

window.addEventListener('keydown', (e) => {
    if (e.shiftKey && e.key.toLowerCase() === 'f') {
        const triangle = new TriangularStructure(grid, 16);
        formations.push(triangle);
        drawAll();
    }
    if (e.shiftKey && e.key.toLowerCase() === 'n') {
        // Spawn a random circle in the last formation (if any)
        if (formations.length > 0) {
            formations[formations.length - 1].circleManager.spawnRandomCircle();
            drawAll();
        }
    }
    // Move selected circle in selected formation
    if (selectedFormation && selectedFormation.selectedCircle !== null) {
        let dx = 0, dy = 0;
        if (e.key === 'ArrowUp') dy = -grid.spacing;
        if (e.key === 'ArrowDown') dy = grid.spacing;
        if (e.key === 'ArrowLeft') dx = -grid.spacing;
        if (e.key === 'ArrowRight') dx = grid.spacing;
        if (dx !== 0 || dy !== 0) {
            selectedFormation.moveSelectedCircle(dx, dy);
            drawAll();
        }
    }
    // Move selected circles in all formations
    formations.forEach(f => {
        if (f.circleManager.selectedCircles && f.circleManager.selectedCircles.size > 0) {
            let dx = 0, dy = 0;
            if (e.key === 'ArrowUp') dy = -grid.spacing;
            if (e.key === 'ArrowDown') dy = grid.spacing;
            if (e.key === 'ArrowLeft') dx = -grid.spacing;
            if (e.key === 'ArrowRight') dx = grid.spacing;
            if (dx !== 0 || dy !== 0) {
                f.circleManager.moveSelectedCircles(dx, dy, () => counter.increment());
                drawAll();
            }
        }
    });
});

canvas.addEventListener('mousedown', (e) => {
    const rect = canvas.getBoundingClientRect();
    const mx = e.clientX - rect.left;
    const my = e.clientY - rect.top;
    selectedFormation = null;
    formations.forEach(f => {
        if (typeof f.selectCircle === 'function') {
            f.selectCircle(mx, my);
            if (f.selectedCircle !== null) selectedFormation = f;
        }
        f.circleManager.selectCircle(mx, my, e.shiftKey);
    });
    // Start multi-drag if ctrl is pressed and multiple circles are selected in any formation
    formations.forEach(f => {
        if (e.ctrlKey && f.circleManager.selectedCircles.size > 1) {
            multiDragActive = true;
            multiDragStart = {x: mx, y: my};
            multiDragOffsets = {};
            f.circleManager.selectedCircles.forEach(i => {
                let c = f.circleManager.circles[i];
                let pos = f.circleManager.logicalToPixel(c.row, c.col);
                multiDragOffsets[`${f}_${i}`] = {f, i, x: pos.x - mx, y: pos.y - my};
            });
        }
    });
    drawAll();
});

canvas.addEventListener('mousemove', (e) => {
    if (multiDragActive && multiDragOffsets) {
        const rect = canvas.getBoundingClientRect();
        const mx = e.clientX - rect.left;
        const my = e.clientY - rect.top;
        Object.values(multiDragOffsets).forEach(({f, i, x, y}) => {
            let c = f.circleManager.circles[i];
            c._dragX = mx + x;
            c._dragY = my + y;
        });
        drawAll();
    } else {
        formations.forEach(f => {
            if (f.circleManager.dragging && f.circleManager.selectedCircle !== null) {
                const rect = canvas.getBoundingClientRect();
                const mx = e.clientX - rect.left;
                const my = e.clientY - rect.top;
                f.circleManager.dragCircle(mx, my);
                drawAll();
            }
        });
    }
});

canvas.addEventListener('mouseup', (e) => {
    if (multiDragActive && multiDragOffsets) {
        const rect = canvas.getBoundingClientRect();
        const mx = e.clientX - rect.left;
        const my = e.clientY - rect.top;
        let movedCount = 0;
        Object.values(multiDragOffsets).forEach(({f, i, x, y}) => {
            let c = f.circleManager.circles[i];
            // Snap to grid
            const logical = f.circleManager.pixelToLogical(mx + x, my + y);
            if (c.row !== logical.row || c.col !== logical.col) {
                movedCount++;
                c.row = logical.row;
                c.col = logical.col;
                c.moved = true;
            }
            delete c._dragX;
            delete c._dragY;
        });
        multiDragActive = false;
        multiDragStart = null;
        multiDragOffsets = null;
        for (let i = 0; i < movedCount; i++) counter.increment();
        drawAll();
    } else {
        formations.forEach(f => {
            if (f.circleManager.dragging && f.circleManager.selectedCircle !== null) {
                const rect = canvas.getBoundingClientRect();
                const mx = e.clientX - rect.left;
                const my = e.clientY - rect.top;
                f.circleManager.dropCircle(mx, my, () => counter.increment());
                drawAll();
            }
        });
    }
});

const triangleInput = document.getElementById('triangle-height-input');
const createTriangleBtn = document.getElementById('create-triangle-btn');
const invertedCheckbox = document.getElementById('inverted-triangle-checkbox');

createTriangleBtn.addEventListener('click', () => {
    const height = parseInt(triangleInput.value, 10);
    const inverted = invertedCheckbox.checked;
    if (!isNaN(height) && height > 0) {
        let newFormation;
        if (inverted) {
            newFormation = new InvertedTriangularStructure(grid, height);
        } else {
            newFormation = new TriangularStructure(grid, height);
        }
        formations.push(newFormation);
        drawAll();
    }
});

canvas.addEventListener('touchstart', (e) => {
    if (e.touches.length === 1) {
        const rect = canvas.getBoundingClientRect();
        const mx = e.touches[0].clientX - rect.left;
        const my = e.touches[0].clientY - rect.top;
        lastTouch = {x: mx, y: my};
        selectedFormation = null;
        let closest = {dist: Infinity, f: null, i: null, pos: null};
        for (let fIdx = formations.length - 1; fIdx >= 0; fIdx--) {
            const f = formations[fIdx];
            f.circleManager.circles.forEach((c, i) => {
                const pos = f.circleManager.logicalToPixel(c.row, c.col);
                const dist = Math.hypot(mx - pos.x, my - pos.y);
                if (dist < closest.dist) {
                    closest = {dist, f, i, pos};
                }
            });
            if (closest.dist <= f.circleManager.grid.spacing/2) {
                break;
            }
        }
        if (closest.dist <= (closest.f ? closest.f.circleManager.grid.spacing/2 : grid.spacing/2)) {
            closest.f.circleManager.selectedCircle = closest.i;
            closest.f.circleManager.dragging = true;
            closest.f.circleManager.dragOffset.x = mx - closest.pos.x;
            closest.f.circleManager.dragOffset.y = my - closest.pos.y;
            selectedFormation = closest.f;
            drawAll();
        }
    }
    e.preventDefault();
});

canvas.addEventListener('touchmove', (e) => {
    if (e.touches.length === 1 && selectedFormation && selectedFormation.circleManager.dragging && selectedFormation.circleManager.selectedCircle !== null) {
        const rect = canvas.getBoundingClientRect();
        const mx = e.touches[0].clientX - rect.left;
        const my = e.touches[0].clientY - rect.top;
        selectedFormation.circleManager.dragCircle(mx, my);
        drawAll();
    }
    e.preventDefault();
});

canvas.addEventListener('touchend', (e) => {
    if (selectedFormation && selectedFormation.circleManager.dragging && selectedFormation.circleManager.selectedCircle !== null) {
        const rect = canvas.getBoundingClientRect();
        let mx = 0, my = 0;
        if (e.changedTouches && e.changedTouches.length > 0) {
            mx = e.changedTouches[0].clientX - rect.left;
            my = e.changedTouches[0].clientY - rect.top;
        }
        selectedFormation.circleManager.dropCircle(mx, my, () => counter.increment());
        drawAll();
    }
    e.preventDefault();
});

function drawAll() {
    grid.drawGrid();
    formations.forEach(f => {
        f.circleManager.drawCircles();
        f.draw();
    });
    // Draw green dot at last touch position for hint
    if (lastTouch) {
        const ctx = grid.ctx;
        ctx.save();
        ctx.beginPath();
        ctx.arc(lastTouch.x, lastTouch.y, 8, 0, Math.PI * 2);
        ctx.fillStyle = 'limegreen';
        ctx.globalAlpha = 0.7;
        ctx.fill();
        ctx.globalAlpha = 1.0;
        ctx.restore();
    }
}
