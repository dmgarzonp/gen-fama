import { Component, Input, OnInit, ElementRef, ViewChild } from '@angular/core';
import { Chart, ChartConfiguration, ChartType, registerables } from 'chart.js';

Chart.register(...registerables);

@Component({
  selector: 'app-chart-ventas',
  standalone: true,
  template: `
    <div class="relative h-64">
      <canvas #chartCanvas [id]="chartId"></canvas>
    </div>
  `,
})
export class ChartVentasComponent implements OnInit {
  @Input() chartId = 'ventas-chart';
  @ViewChild('chartCanvas', { static: true }) chartCanvas!: ElementRef<HTMLCanvasElement>;

  private chart?: Chart;

  ventasData = {
    labels: this.getUltimos30Dias(),
    datasets: [
      {
        label: 'Ventas diarias',
        data: this.generarDatosVentas(),
        borderColor: 'rgb(16, 185, 129)',
        backgroundColor: 'rgba(16, 185, 129, 0.1)',
        tension: 0.4,
        fill: true
      }
    ]
  };

  chartConfig: ChartConfiguration = {
    type: 'line' as ChartType,
    data: this.ventasData,
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          display: false
        }
      },
      scales: {
        y: {
          beginAtZero: true,
          ticks: {
            callback: (value) => '$' + value.toLocaleString()
          }
        }
      }
    }
  };

  ngOnInit(): void {
    setTimeout(() => {
      this.renderChart();
    }, 100);
  }

  private renderChart(): void {
    if (this.chart) {
      this.chart.destroy();
    }
    const ctx = this.chartCanvas.nativeElement.getContext('2d');
    if (ctx) {
      this.chart = new Chart(ctx, this.chartConfig);
    }
  }

  private getUltimos30Dias(): string[] {
    const labels: string[] = [];
    const today = new Date();

    for (let i = 29; i >= 0; i--) {
      const date = new Date(today);
      date.setDate(date.getDate() - i);
      labels.push(date.toLocaleDateString('es', { month: 'short', day: 'numeric' }));
    }

    return labels;
  }

  private generarDatosVentas(): number[] {
    const datos: number[] = [];
    const base = 3000;

    for (let i = 0; i < 30; i++) {
      const variacion = Math.random() * 2000 - 1000;
      datos.push(Math.max(1000, base + variacion));
    }

    return datos;
  }
}
