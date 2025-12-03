export class DataVisualization {
  constructor() {
    this.charts = new Map();
    this.colors = {
      primary: '#2C5282',
      accent: '#FF6B6B',
      success: '#16A34A',
      warning: '#F59E0B',
      danger: '#DC2626'
    };
  }

  initialize() {
    this.createTrendCharts();
    this.createProgressRings();
  }

  createTrendCharts() {
    // Instagram trend chart
    const instagramCanvas = document.getElementById('instagram-trend');
    if (instagramCanvas) {
      this.createMiniChart(instagramCanvas, [45, 52, 48, 58, 63, 68, 72, 78, 82, 88, 91, 95], this.colors.primary);
    }

    // Facebook trend chart
    const facebookCanvas = document.getElementById('facebook-trend');
    if (facebookCanvas) {
      this.createMiniChart(facebookCanvas, [120, 125, 118, 132, 138, 145, 142, 148, 155, 162, 168, 175], this.colors.accent);
    }
  }

  createMiniChart(canvas, data, color) {
    const ctx = canvas.getContext('2d');
    const width = canvas.width;
    const height = canvas.height;
    
    // Clear canvas
    ctx.clearRect(0, 0, width, height);
    
    // Calculate points
    const max = Math.max(...data);
    const min = Math.min(...data);
    const range = max - min || 1;
    const stepX = width / (data.length - 1);
    
    // Create gradient
    const gradient = ctx.createLinearGradient(0, 0, 0, height);
    gradient.addColorStop(0, color + '40');
    gradient.addColorStop(1, color + '00');
    
    // Draw area
    ctx.beginPath();
    ctx.moveTo(0, height);
    
    data.forEach((value, index) => {
      const x = index * stepX;
      const y = height - ((value - min) / range) * height * 0.8 - height * 0.1;
      
      if (index === 0) {
        ctx.lineTo(x, y);
      } else {
        // Smooth curve
        const prevX = (index - 1) * stepX;
        const prevY = height - ((data[index - 1] - min) / range) * height * 0.8 - height * 0.1;
        const cpX = (prevX + x) / 2;
        ctx.quadraticCurveTo(prevX, prevY, cpX, (prevY + y) / 2);
        ctx.quadraticCurveTo(x, y, x, y);
      }
    });
    
    ctx.lineTo(width, height);
    ctx.closePath();
    ctx.fillStyle = gradient;
    ctx.fill();
    
    // Draw line
    ctx.beginPath();
    ctx.moveTo(0, height - ((data[0] - min) / range) * height * 0.8 - height * 0.1);
    
    data.forEach((value, index) => {
      const x = index * stepX;
      const y = height - ((value - min) / range) * height * 0.8 - height * 0.1;
      
      if (index === 0) {
        ctx.moveTo(x, y);
      } else {
        const prevX = (index - 1) * stepX;
        const prevY = height - ((data[index - 1] - min) / range) * height * 0.8 - height * 0.1;
        const cpX = (prevX + x) / 2;
        ctx.quadraticCurveTo(prevX, prevY, cpX, (prevY + y) / 2);
        ctx.quadraticCurveTo(x, y, x, y);
      }
    });
    
    ctx.strokeStyle = color;
    ctx.lineWidth = 2;
    ctx.stroke();
    
    // Store chart reference
    this.charts.set(canvas.id, { ctx, data, color, width, height });
  }

  createProgressRings() {
    const progressCanvas = document.getElementById('total-progress');
    if (progressCanvas) {
      this.createProgressRing(progressCanvas, 75, this.colors.primary);
    }
  }

  createProgressRing(canvas, percentage, color) {
    const ctx = canvas.getContext('2d');
    const centerX = canvas.width / 2;
    const centerY = canvas.height / 2;
    const radius = 25;
    const lineWidth = 4;
    
    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    // Background circle
    ctx.beginPath();
    ctx.arc(centerX, centerY, radius, 0, 2 * Math.PI);
    ctx.strokeStyle = '#E5E7EB';
    ctx.lineWidth = lineWidth;
    ctx.stroke();
    
    // Progress arc
    const startAngle = -Math.PI / 2;
    const endAngle = startAngle + (2 * Math.PI * percentage / 100);
    
    ctx.beginPath();
    ctx.arc(centerX, centerY, radius, startAngle, endAngle);
    ctx.strokeStyle = color;
    ctx.lineWidth = lineWidth;
    ctx.lineCap = 'round';
    ctx.stroke();
    
    // Store reference
    this.charts.set(canvas.id, { ctx, percentage, color, centerX, centerY, radius, lineWidth });
  }

  updateChart(canvasId, newData) {
    const chart = this.charts.get(canvasId);
    if (!chart) return;
    
    if (canvasId.includes('trend')) {
      this.createMiniChart(chart.ctx.canvas, newData, chart.color);
    } else if (canvasId.includes('progress')) {
      this.createProgressRing(chart.ctx.canvas, newData, chart.color);
    }
  }

  animateValue(canvasId, targetValue, duration = 1000) {
    const chart = this.charts.get(canvasId);
    if (!chart) return;
    
    const startValue = chart.percentage || 0;
    const startTime = Date.now();
    
    const animate = () => {
      const currentTime = Date.now();
      const elapsed = currentTime - startTime;
      const progress = Math.min(elapsed / duration, 1);
      
      const easeOutQuart = 1 - Math.pow(1 - progress, 4);
      const currentValue = startValue + (targetValue - startValue) * easeOutQuart;
      
      if (canvasId.includes('progress')) {
        this.createProgressRing(chart.ctx.canvas, Math.round(currentValue), chart.color);
      }
      
      if (progress < 1) {
        requestAnimationFrame(animate);
      }
    };
    
    animate();
  }

  // Add interactive hover effects
  addInteractiveEffects() {
    this.charts.forEach((chart, canvasId) => {
      const canvas = chart.ctx.canvas;
      
      canvas.addEventListener('mouseenter', () => {
        canvas.style.transform = 'scale(1.05)';
        canvas.style.transition = 'transform 0.2s ease';
      });
      
      canvas.addEventListener('mouseleave', () => {
        canvas.style.transform = 'scale(1)';
      });
    });
  }
}