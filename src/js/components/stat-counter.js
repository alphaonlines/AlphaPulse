export class StatCounter {
  constructor(element, targetValue, duration = 1000) {
    this.element = element;
    this.targetValue = targetValue;
    this.duration = duration;
    this.startValue = 0;
    this.startTime = null;
  }

  animate() {
    if (!this.element) return;

    // Set initial value
    this.element.textContent = '0';
    
    // Use requestAnimationFrame for smooth animation
    const updateCounter = (currentTime) => {
      if (!this.startTime) this.startTime = currentTime;
      
      const elapsed = currentTime - this.startTime;
      const progress = Math.min(elapsed / this.duration, 1);
      
      // Easing function for smooth animation
      const easeOutQuart = 1 - Math.pow(1 - progress, 4);
      const currentValue = Math.floor(this.startValue + (this.targetValue - this.startValue) * easeOutQuart);
      
      this.element.textContent = currentValue.toLocaleString();
      
      if (progress < 1) {
        requestAnimationFrame(updateCounter);
      } else {
        this.element.textContent = this.targetValue.toLocaleString();
      }
    };
    
    requestAnimationFrame(updateCounter);
  }

  updateTarget(newTarget) {
    this.targetValue = newTarget;
    this.startValue = parseInt(this.element.textContent.replace(/,/g, '')) || 0;
    this.startTime = null;
    this.animate();
  }
}

export class CounterManager {
  constructor() {
    this.counters = new Map();
  }

  initialize() {
    const counterElements = document.querySelectorAll('.stat-value');
    
    counterElements.forEach(element => {
      const targetValue = parseInt(element.getAttribute('data-count')) || 0;
      const counter = new StatCounter(element, targetValue);
      this.counters.set(element, counter);
      
      // Start animation after a small delay for visual effect
      setTimeout(() => counter.animate(), 100);
    });
  }

  updateCounter(element, newValue) {
    const counter = this.counters.get(element);
    if (counter) {
      counter.updateTarget(newValue);
    }
  }

  // Animate all counters simultaneously
  animateAll() {
    this.counters.forEach(counter => counter.animate());
  }
}