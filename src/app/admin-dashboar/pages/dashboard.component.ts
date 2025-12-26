import { Component, OnInit } from '@angular/core';
import { IconsModule } from '../../shared/icons.module';
import { ChartVentasComponent } from '../components/chart-ventas.component';
import { ChartCategoriasComponent } from '../components/chart-categorias.component';
import { ChartTopProductosComponent } from '../components/chart-top-productos.component';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [IconsModule, ChartVentasComponent, ChartCategoriasComponent, ChartTopProductosComponent],
  templateUrl: './dashboard.component.html',
})
export class DashboardComponent implements OnInit {
  ventasHoy = 4580;
  ventasAyer = 4089;
  ventasMes = 67240;
  productosStock = 3456;
  alertasCriticas = 8;
  cajaActual = 12340;
  ticketsHoy = 127;
  stockBajo = 23;

  ngOnInit(): void { }

  getVariacionPorcentual(actual: number, anterior: number): number {
    return Math.round(((actual - anterior) / anterior) * 100);
  }

  getVariacionVentasHoy(): number {
    return this.getVariacionPorcentual(this.ventasHoy, this.ventasAyer);
  }
}
