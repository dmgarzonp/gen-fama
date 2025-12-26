import { Component, Input, OnInit, ElementRef, ViewChild } from '@angular/core';
import { Chart, ChartConfiguration, ChartType, registerables } from 'chart.js';

Chart.register(...registerables);

@Component({
  selector: 'app-chart-top-productos',
  standalone: true,
  template: `
    <div class="relative h-64">
      <canvas #chartCanvas [id]="chartId"></canvas>
    </div>
  `,
})
export class ChartTopProductosComponent implements OnInit {
  @Input() chartId = 'top-productos-chart';
  @ViewChild('chartCanvas', { static: true }) chartCanvas!: ElementRef<HTMLCanvasElement>;

  private chart?: Chart;

  topProductosData = {
    labels: [
      'Paracetamol 500mg',
      'Ibuprofeno 400mg',
      'Amoxicilina 500mg',
      'Omeprazol 20mg',
      'Loratadina 10mg',
      'Vitamina C',
      'Salbutamol',
      'Insulina',
      'Aspirina 100mg',
      'Prednisona 5mg'
    ],
    datasets: [
      {
        label: 'Unidades vendidas',
        data: [245, 198, 176, 154, 143, 132, 121, 110, 98, 87],
        backgroundColor: 'rgb(59, 130, 246)',
        borderRadius: 4
      }
    ]
  };

  chartConfig: ChartConfiguration = {
    type: 'bar' as ChartType,
    data: this.topProductosData,
    options: {
      responsive: true,
      maintainAspectRatio: false,
      indexAxis: 'y',
      plugins: {
        legend: {
          display: false
        }
      },
      scales: {
        x: {
          beginAtZero: true,
          ticks: {
            callback: (value) => value.toLocaleString()
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
}
