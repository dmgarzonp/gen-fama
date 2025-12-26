import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { IconsModule } from '../../shared/icons.module';
import { Cliente } from '@shared/models/cliente.model';

@Component({
  selector: 'app-cliente-form',
  standalone: true,
  imports: [CommonModule, FormsModule, IconsModule],
  templateUrl: './cliente-form.component.html',
})
export class ClienteFormComponent implements OnInit {
  cliente: Cliente | null = null;

  // Datos de ejemplo (en producción vendrían de un servicio)
  // Comentado porque usa camelCase y el modelo usa snake_case
  /* private clientesEjemplo: Cliente[] = [
    {
      id: 1,
      nombreCompleto: 'Ana Gómez Martínez',
      identificacion: '12345678',
      telefono: '+57 3201234567',
      email: 'ana.gomez@email.com',
      direccion: 'Cra 45 #123-45, Bogotá',
      fechaNacimiento: '1985-04-12',
      alergias: 'Penicilina',
      enfermedadesCronicas: 'Diabetes tipo 2',
      tipo: 'VIP',
      limiteCredito: 200000,
      saldoPendiente: 85000,
      puntos: 120,
      compras: 15,
      recetas: 3,
      productosFrecuentes: ['Losartán 50mg', 'Metformina 850mg', 'Insulina'],
      fechaRegistro: '2023-01-15',
      estado: 'activo'
    },
    {
      id: 2,
      nombreCompleto: 'Carlos Rodríguez Pérez',
      identificacion: '98765432',
      telefono: '+57 3109876543',
      email: 'carlos.rodriguez@email.com',
      direccion: 'Calle 72 #10-20, Medellín',
      fechaNacimiento: '1978-09-25',
      alergias: 'Ninguna',
      enfermedadesCronicas: 'Hipertensión',
      tipo: 'Crédito',
      limiteCredito: 150000,
      saldoPendiente: 0,
      puntos: 85,
      compras: 22,
      recetas: 5,
      productosFrecuentes: ['Amlodipino 5mg', 'Atorvastatina 20mg'],
      fechaRegistro: '2022-11-08',
      estado: 'activo'
    },
    {
      id: 3,
      nombreCompleto: 'María López Sánchez',
      identificacion: '11223344',
      telefono: '+57 3151122334',
      email: 'maria.lopez@email.com',
      direccion: 'Av 68 #45-30, Cali',
      fechaNacimiento: '1992-03-18',
      alergias: 'Sulfas',
      enfermedadesCronicas: 'Ninguna',
      tipo: 'Regular',
      limiteCredito: 0,
      saldoPendiente: 0,
      puntos: 45,
      compras: 8,
      recetas: 1,
      productosFrecuentes: ['Paracetamol 500mg', 'Ibuprofeno 400mg'],
      fechaRegistro: '2024-05-20',
      estado: 'activo'
    },
    {
      id: 4,
      nombreCompleto: 'Juan David Torres',
      identificacion: '55667788',
      telefono: '+57 3005566778',
      email: 'juan.torres@email.com',
      direccion: 'Cra 30 #25-10, Barranquilla',
      fechaNacimiento: '1989-07-30',
      alergias: 'Ninguna',
      enfermedadesCronicas: 'Asma',
      tipo: 'VIP',
      limiteCredito: 300000,
      saldoPendiente: 120000,
      puntos: 200,
      compras: 35,
      recetas: 8,
      productosFrecuentes: ['Salbutamol inhalador', 'Montelukast 10mg'],
      fechaRegistro: '2021-08-12',
      estado: 'activo'
    },
    {
      id: 5,
      nombreCompleto: 'Laura Fernández',
      identificacion: '99887766',
      telefono: '+57 3189988776',
      email: 'laura.fernandez@email.com',
      direccion: 'Calle 100 #50-15, Bogotá',
      fechaNacimiento: '1995-12-05',
      alergias: 'Ninguna',
      enfermedadesCronicas: 'Ninguna',
      tipo: 'Regular',
      limiteCredito: 0,
      saldoPendiente: 0,
      puntos: 25,
      compras: 5,
      recetas: 0,
      productosFrecuentes: ['Vitamina D', 'Calcio'],
      fechaRegistro: '2024-09-10',
      estado: 'activo'
    },
    {
      id: 6,
      nombreCompleto: 'Roberto Silva',
      identificacion: '44332211',
      telefono: '+57 3124433221',
      email: 'roberto.silva@email.com',
      direccion: 'Av 19 #80-25, Bogotá',
      fechaNacimiento: '1975-11-20',
      alergias: 'Penicilina, Aspirina',
      enfermedadesCronicas: 'Artritis reumatoide',
      tipo: 'Crédito',
      limiteCredito: 100000,
      saldoPendiente: 45000,
      puntos: 60,
      compras: 12,
      recetas: 4,
      productosFrecuentes: ['Metotrexato 2.5mg', 'Ácido fólico'],
      fechaRegistro: '2023-03-22',
      estado: 'activo'
    },
    {
      id: 7,
      nombreCompleto: 'Sofía Ramírez',
      identificacion: '22334455',
      telefono: '+57 3142233445',
      email: 'sofia.ramirez@email.com',
      direccion: 'Cra 15 #40-50, Medellín',
      fechaNacimiento: '2000-02-14',
      alergias: 'Ninguna',
      enfermedadesCronicas: 'Ninguna',
      tipo: 'Regular',
      limiteCredito: 0,
      saldoPendiente: 0,
      puntos: 15,
      compras: 3,
      recetas: 0,
      productosFrecuentes: ['Anticonceptivos'],
      fechaRegistro: '2024-11-01',
      estado: 'activo'
    },
    {
      id: 8,
      nombreCompleto: 'Pedro Martínez',
      identificacion: '66778899',
      telefono: '+57 3166677889',
      email: 'pedro.martinez@email.com',
      direccion: 'Calle 50 #30-20, Cali',
      fechaNacimiento: '1982-06-08',
      alergias: 'Ninguna',
      enfermedadesCronicas: 'Gastritis crónica',
      tipo: 'VIP',
      limiteCredito: 250000,
      saldoPendiente: 0,
      puntos: 150,
      compras: 28,
      recetas: 6,
      productosFrecuentes: ['Omeprazol 20mg', 'Ranitidina 150mg'],
      fechaRegistro: '2022-04-18',
      estado: 'activo'
    }
  ]; */

  formulario: Partial<Cliente> = {
    nombre_completo: '',
    identificacion: '',
    telefono: '',
    email: '',
    direccion: '',
    fecha_nacimiento: '',
    alergias: '',
    enfermedades_cronicas: '',
    tipo: 'Regular',
    limite_credito: 0,
    saldo_pendiente: 0,
    puntos: 0,
    compras: 0,
    recetas: 0,
    productos_frecuentes: [],
    fecha_registro: new Date().toISOString().split('T')[0],
    estado: 'activo'
  };

  tiposCliente = ['Regular', 'VIP', 'Crédito'];

  constructor(
    private route: ActivatedRoute,
    private router: Router
  ) {}

  ngOnInit() {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      // TODO: Cargar cliente desde servicio
      // this.cliente = await this.clientesService.getById(parseInt(id));
      // if (this.cliente) {
      //   this.formulario = { ...this.cliente };
      // }
    }
  }

  guardarCliente() {
    if (!this.formulario.nombre_completo || !this.formulario.identificacion || 
        !this.formulario.telefono || !this.formulario.email) {
      alert('Por favor complete los campos obligatorios');
      return;
    }

    // En producción aquí se haría la llamada al servicio
    alert(this.cliente ? 'Cliente actualizado correctamente' : 'Cliente creado correctamente');
    this.router.navigate(['/clientes']);
  }

  cancelar() {
    this.router.navigate(['/clientes']);
  }
}
