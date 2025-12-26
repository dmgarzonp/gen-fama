import { Component, signal, computed, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, ActivatedRoute, RouterLink } from '@angular/router';
import { IconsModule } from '../../../shared/icons.module';
import { ProveedoresService } from '@features/compras/services/proveedores.service';
import { Proveedor } from '@shared/models/proveedor.model';

@Component({
    selector: 'app-proveedor-form',
    standalone: true,
    imports: [CommonModule, FormsModule, RouterLink, IconsModule],
    templateUrl: './proveedor-form.component.html',
})
export class ProveedorFormComponent implements OnInit {
    private router = inject(Router);
    private route = inject(ActivatedRoute);
    private proveedoresService = inject(ProveedoresService);

    // Modo edición
    proveedorId = signal<number | null>(null);
    modoEdicion = computed(() => this.proveedorId() !== null);

    // Formulario
    nombre = signal('');
    razonSocial = signal('');
    ruc = signal('');
    contacto = signal('');
    telefono = signal('');
    email = signal('');
    direccion = signal('');
    ciudad = signal('');
    pais = signal('Perú');

    diasCredito = signal(30);
    descuentoHabitual = signal(0);
    montoMinimoCompra = signal(0);

    calificacion = signal(5);
    activo = signal(true);
    notas = signal('');

    ngOnInit() {
        const id = this.route.snapshot.paramMap.get('id');
        if (id) {
            this.cargarProveedor(Number(id));
        }
    }

    async cargarProveedor(id: number) {
        const proveedor = await this.proveedoresService.getById(id);
        if (proveedor) {
            this.proveedorId.set(id);
            this.nombre.set(proveedor.nombre);
            this.razonSocial.set(proveedor.razon_social);
            this.ruc.set(proveedor.ruc);
            this.contacto.set(proveedor.contacto);
            this.telefono.set(proveedor.telefono);
            this.email.set(proveedor.email);
            this.direccion.set(proveedor.direccion);
            this.ciudad.set(proveedor.ciudad);
            this.pais.set(proveedor.pais);
            this.diasCredito.set(proveedor.dias_credito);
            this.descuentoHabitual.set(proveedor.descuento_habitual);
            this.montoMinimoCompra.set(proveedor.monto_minimo_compra);
            this.calificacion.set(proveedor.calificacion);
            this.activo.set(proveedor.activo === 1 || proveedor.activo === true);
            this.notas.set(proveedor.notas || '');
        }
    }

    async guardar() {
        if (!this.validarFormulario()) return;

        let totalCompras = 0;
        let ultimaCompra = undefined;
        let productosOfrecidos = [];
        let fechaRegistro = new Date().toISOString();

        if (this.modoEdicion()) {
            const extra = await this.proveedoresService.getById(this.proveedorId()!);
            if (extra) {
                totalCompras = extra.total_compras;
                ultimaCompra = extra.ultima_compra;
                productosOfrecidos = extra.productos_ofrecidos as any;
                fechaRegistro = extra.fecha_registro;
            }
        }

        const proveedor: Proveedor = {
            id: this.proveedorId() || undefined,
            nombre: this.nombre(),
            razon_social: this.razonSocial(),
            ruc: this.ruc(),
            contacto: this.contacto(),
            telefono: this.telefono(),
            email: this.email(),
            direccion: this.direccion(),
            ciudad: this.ciudad(),
            pais: this.pais(),
            dias_credito: this.diasCredito(),
            descuento_habitual: this.descuentoHabitual(),
            monto_minimo_compra: this.montoMinimoCompra(),
            total_compras: totalCompras,
            ultima_compra: ultimaCompra,
            calificacion: this.calificacion(),
            productos_ofrecidos: productosOfrecidos,
            activo: this.activo(),
            fecha_registro: fechaRegistro,
            notas: this.notas()
        };

        await this.proveedoresService.upsert(proveedor);
        this.router.navigate(['/compras/proveedores']);
    }

    private validarFormulario(): boolean {
        if (!this.nombre()) {
            alert('El nombre es requerido');
            return false;
        }

        if (!this.razonSocial()) {
            alert('La razón social es requerida');
            return false;
        }

        if (!this.ruc() || this.ruc().length < 11) {
            alert('El RUC debe tener al menos 11 caracteres');
            return false;
        }

        if (!this.email() || !this.email().includes('@')) {
            alert('El email no es válido');
            return false;
        }

        return true;
    }

    cancelar() {
        if (confirm('¿Descartar cambios?')) {
            this.router.navigate(['/compras/proveedores']);
        }
    }
}
