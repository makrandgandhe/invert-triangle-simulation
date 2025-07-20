// FloatingCounter displays a counter at the top right of the screen
class FloatingCounter {
    constructor(onReset) {
        this.count = 0;
        this.onReset = onReset;
        this.createCounterElement();
    }

    createCounterElement() {
        this.el = document.createElement('div');
        this.el.id = 'floating-counter';
        this.el.style.position = 'fixed';
        this.el.style.top = '20px';
        this.el.style.right = '30px';
        this.el.style.background = 'rgba(0,0,0,0.8)';
        this.el.style.color = '#fff';
        this.el.style.padding = '12px 24px';
        this.el.style.borderRadius = '8px';
        this.el.style.fontSize = '1.5rem';
        this.el.style.zIndex = '1000';
        this.el.style.boxShadow = '0 2px 8px rgba(0,0,0,0.2)';
        this.el.innerHTML = `<span id="counter-label">Moves: ${this.count}</span> <button id="reset-counter-btn" style="margin-left:16px;padding:4px 12px;font-size:1rem;border:none;border-radius:4px;background:#0078d4;color:#fff;cursor:pointer;">Reset</button>`;
        document.body.appendChild(this.el);
        document.getElementById('reset-counter-btn').onclick = () => this.reset();
    }

    increment() {
        this.count++;
        this.el.querySelector('#counter-label').textContent = `Moves: ${this.count}`;
    }

    reset() {
        this.count = 0;
        this.el.querySelector('#counter-label').textContent = `Moves: ${this.count}`;
        if (typeof this.onReset === 'function') {
            this.onReset();
        }
    }
}

export { FloatingCounter };
