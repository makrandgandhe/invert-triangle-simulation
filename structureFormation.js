import { CircleManager } from './circleManager.js';

// structureFormation holds circles and their logical positions, managed by a CircleManager
class StructureFormation {
    constructor(grid) {
        this.grid = grid;
        this.circleManager = new CircleManager(grid); // Each formation gets its own CircleManager
        this.circles = this.circleManager.circles;
    }

    // Add a circle at logical position (delegates to circleManager)
    addCircle(row, col) {
        this.circles.push({row, col});
        this.circleManager.circles.push({row, col});
    }

    // Draw all circles in the formation (delegates to circleManager)
    draw() {
        // Optionally highlight formation circles
        // this.circles.forEach((c) => {
        //     const pos = this.grid.logicalToPixel(c.row, c.col);
        //     this.grid.ctx.beginPath();
        //     this.grid.ctx.arc(pos.x, pos.y, this.grid.spacing/2, 0, Math.PI * 2);
        //     this.grid.ctx.strokeStyle = '#0ff';
        //     this.grid.ctx.lineWidth = 2;
        //     this.grid.ctx.stroke();
        // });
    }
}

// TriangularStructure creates a triangle of circles managed by CircleManager
class TriangularStructure extends StructureFormation {
    constructor(grid, levels) {
        super(grid);
        this.levels = levels;
        this.generateTriangle();
    }

    // Generate triangle formation
    generateTriangle() {
        this.circleManager.circles = [];
        this.circles = [];
        const baseRow = 2;
        const centerX = Math.floor(this.grid.canvas.width / 2);
        let count = 0;
        for (let row = 0; row < this.levels; row++) {
            // For each row, place (row+1) circles
            // Calculate the pixel position for the first circle in the row
            const y = (baseRow + row) * this.grid.spacing + this.grid.spacing / 2 + this.grid.offsetY;
            // Calculate total width of the row
            const rowWidth = (row + 1) * this.grid.spacing;
            // Center the row horizontally
            let startX = centerX - rowWidth / 2;
            if ((baseRow + row) % 2 !== 0) {
                startX += this.grid.spacing / 2; // brick offset for odd rows
            }
            for (let col = 0; col <= row; col++) {
                const x = startX + col * this.grid.spacing;
                // Convert pixel position to logical grid position
                const logical = this.grid.pixelToLogical(x, y);
                // Check if cell is already occupied
                const exists = this.circleManager.circles.some(c => c.row === logical.row && c.col === logical.col);
                if (!exists) {
                    this.addCircle(logical.row, logical.col);
                    count++;
                }
            }
        }
        console.log(`Total circles in triangle formation: ${count}`);
    }
}

// InvertedTriangularStructure creates an inverted triangle of circles managed by CircleManager
class InvertedTriangularStructure extends StructureFormation {
    constructor(grid, levels) {
        super(grid);
        this.levels = levels;
        this.generateInvertedTriangle();
    }

    // Generate inverted triangle formation
    generateInvertedTriangle() {
        this.circleManager.circles = [];
        this.circles = [];
        const baseRow = 2;
        const centerX = Math.floor(this.grid.canvas.width / 2);
        let count = 0;
        for (let row = 0; row < this.levels; row++) {
            // For each row, place (levels-row) circles
            // Calculate the pixel position for the first circle in the row
            const y = (baseRow + row) * this.grid.spacing + this.grid.spacing / 2 + this.grid.offsetY;
            const rowWidth = (this.levels - row) * this.grid.spacing;
            let startX = centerX - rowWidth / 2;
            if ((baseRow + row) % 2 !== 0) {
                startX += this.grid.spacing / 2; // brick offset for odd rows
            }
            for (let col = 0; col < this.levels - row; col++) {
                const x = startX + col * this.grid.spacing;
                const logical = this.grid.pixelToLogical(x, y);
                const exists = this.circleManager.circles.some(c => c.row === logical.row && c.col === logical.col);
                if (!exists) {
                    this.addCircle(logical.row, logical.col);
                    count++;
                }
            }
        }
        console.log(`Total circles in inverted triangle formation: ${count}`);
    }
}

export { StructureFormation, TriangularStructure, InvertedTriangularStructure };
