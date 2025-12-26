import { Directive, Input, TemplateRef, ViewContainerRef, effect, inject } from '@angular/core';
import { PermissionsService } from '../services/permissions.service';
import { ModuleName, ActionName } from '@shared/models/usuario.model';

@Directive({
    selector: '[appHasPermission]',
    standalone: true
})
export class HasPermissionDirective {
    private templateRef = inject(TemplateRef);
    private viewContainer = inject(ViewContainerRef);
    private permissionsService = inject(PermissionsService);

    @Input('appHasPermission') permission!: { module: ModuleName, action: ActionName };

    constructor() {
        // Reactively check permissions if they change (e.g. login/logout or profile update)
        // Since we don't have a signal for "permissions changed" exposed directly as a single trigger other than the user change
        // We rely on the service check. For better reactivity, the service should expose a signal.
        // For this implementation, we assume the directive is re-evaluated on change detection or we bind to a signal if needed.
        // Actually, structural directives inputs change trigger ngOnChanges, but the service state might not.
        // Ideally permissionsService exposes a signal for the current user's permissions.
    }

    ngOnInit() {
        this.updateView();
    }

    private updateView() {
        if (this.permissionsService.hasPermission(this.permission.module, this.permission.action)) {
            this.viewContainer.createEmbeddedView(this.templateRef);
        } else {
            this.viewContainer.clear();
        }
    }
}
