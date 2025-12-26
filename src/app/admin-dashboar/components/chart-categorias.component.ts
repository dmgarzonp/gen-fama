import { Component, Input, OnInit, ElementRef, ViewChild } from '@angular/core';
import { Chart, ChartConfiguration, ChartType, registerables } from 'chart.js';

Chart.register(...registerables);

@Component({
  selector: 'app-chart-categorias',
  standalone: true,
  template: `
    <div class="relative h-64">
      <canvas #chartCanvas [id]="chartId"></canvas>
    </div>
  `,
})
export class ChartCategoriasComponent implements OnInit {
  @Input() chartId = 'categorias-chart';
  @ViewChild('chartCanvas', { static: true }) chartCanvas!: ElementRef<HTMLCanvasElement>;

  private chart?: Chart;

  categoriasData = {
    labels: ['Medicamentos', 'Cuidado Personal', 'Vitaminas', 'Bebés', 'Otros'],
    datasets: [
      {
        data: [35, 25, 20, 15, 5],
        backgroundColor: [
          'rgb(59, 130, 246)',
          'rgb(16, 185, 129)',
          'rgb(251, 146, 60)',
          'rgb(147, 51, 234)',
          'rgb(107, 114, 128)'
        ],
        borderWidth: 0
      }
    ]
  };

  chartConfig: ChartConfiguration = {
    type: 'doughnut' as ChartType,
    data: this.categoriasData,
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          position: 'bottom',
          labels: {
            padding: 15,
            usePointStyle: true,
            font: {
              size: 11
            }
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
