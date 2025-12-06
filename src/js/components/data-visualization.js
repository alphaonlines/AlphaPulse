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
    this.renderLikesChart(Array(14).fill(0));
  }

  createTrendCharts() {
    // Hero engagement trend
    const engagementCanvas = document.getElementById('engagement-trend');
    if (engagementCanvas) {
      this.createMiniChart(engagementCanvas, [42, 48, 46, 53, 57, 61, 64, 68, 72, 75, 78, 82], this.colors.primary);
    }

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
    this.charts.set(canvas.id, { ctx, data, color, width, height, type: 'mini-line' });
  }

  createProgressRings() {
    const progressCanvas = document.getElementById('total-progress');
    if (progressCanvas) {
      // Initialize at 0%; DashboardManager will animate based on live data
      this.createProgressRing(progressCanvas, 0, this.colors.primary);
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
    this.charts.set(canvas.id, { ctx, percentage, color, centerX, centerY, radius, lineWidth, type: 'progress-ring' });
  }

  updateChart(canvasId, newData) {
    const chart = this.charts.get(canvasId);
    if (!chart) return;

    switch (chart.type) {
      case 'mini-line':
        this.createMiniChart(chart.ctx.canvas, newData, chart.color);
        break;
      case 'progress-ring':
        this.createProgressRing(chart.ctx.canvas, newData, chart.color);
        break;
      case 'bar':
        this.createBarChart(chart.ctx.canvas, newData, chart.color, chart.options);
        break;
      default:
        break;
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

  renderLikesChart(data) {
    const likesCanvas = document.getElementById('likes-trend');
    if (!likesCanvas) return;

    if (this.charts.has(likesCanvas.id)) {
      this.updateChart(likesCanvas.id, data);
    } else {
      this.createBarChart(likesCanvas, data, this.colors.accent, {
        highlightBarIndex: data.length - 1,
        averageLineColor: this.colors.primary
      });
    }
  }

  createBarChart(canvas, data, color, options = {}) {
    const ctx = canvas.getContext('2d');
    const width = canvas.width;
    const height = canvas.height;

    const {
      highlightBarIndex = -1,
      averageLineColor = color,
      gridColor = '#E5E7EB',
      labelColor = '#6B7280'
    } = options;

    if (!data.length) return;

    ctx.clearRect(0, 0, width, height);

    const max = Math.ceil(Math.max(5, ...data) / 5) * 5;
    const padding = 22;
    const barWidth = (width - padding * 2) / data.length - 6;
    const chartHeight = height - padding * 2;

    // Draw grid lines and y-axis labels
    ctx.strokeStyle = gridColor;
    ctx.fillStyle = labelColor;
    ctx.font = '12px "Inter", system-ui, -apple-system, sans-serif';
    ctx.textAlign = 'left';
    ctx.textBaseline = 'middle';

    const gridLines = 4;
    for (let i = 0; i <= gridLines; i++) {
      const y = padding + (chartHeight / gridLines) * i;
      const value = Math.round(max - (max / gridLines) * i);

      ctx.beginPath();
      ctx.moveTo(padding, y);
      ctx.lineTo(width - padding, y);
      ctx.lineWidth = i === gridLines ? 1.5 : 1;
      ctx.setLineDash(i === gridLines ? [] : [4, 4]);
      ctx.stroke();
      ctx.setLineDash([]);

      if (i < gridLines) {
        ctx.fillText(value.toString(), 4, y);
      }
    }

    data.forEach((value, index) => {
      const x = padding + index * (barWidth + 6);
      const barHeight = (value / max) * chartHeight;
      const y = height - padding - barHeight;

      const isHighlight = index === highlightBarIndex;
      const barColor = isHighlight ? this.colors.success : color;
      const gradient = ctx.createLinearGradient(0, y, 0, height - padding);
      gradient.addColorStop(0, barColor);
      gradient.addColorStop(1, barColor + '80');

      ctx.fillStyle = gradient;
      ctx.beginPath();
      if (typeof ctx.roundRect === 'function') {
        ctx.roundRect(x, y, barWidth, barHeight, 6);
      } else {
        ctx.rect(x, y, barWidth, barHeight);
      }
      ctx.fill();

      // Draw minimal x-axis labels every few days
      if (data.length <= 14 ? index % 3 === 0 || index === data.length - 1 : index % 4 === 0) {
        const daysAgo = data.length - 1 - index;
        const label = daysAgo === 0 ? 'Today' : `${daysAgo}d`;
        ctx.fillStyle = labelColor;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'top';
        ctx.fillText(label, x + barWidth / 2, height - padding + 6);
      }
    });

    // Draw average line across bars
    const average = data.reduce((sum, value) => sum + value, 0) / data.length;
    const avgY = height - padding - (average / max) * chartHeight;

    ctx.strokeStyle = averageLineColor;
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.moveTo(padding, avgY);
    ctx.lineTo(width - padding, avgY);
    ctx.stroke();

    ctx.fillStyle = averageLineColor;
    ctx.textAlign = 'right';
    ctx.textBaseline = 'bottom';
    ctx.fillText(`Avg ${average.toFixed(0)}`, width - 6, avgY - 4);

    this.charts.set(canvas.id, { ctx, data, color, width, height, type: 'bar', options });
  }
}
