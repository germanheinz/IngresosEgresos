import { Component, OnInit, OnDestroy } from '@angular/core';
import { Store } from '@ngrx/store';
import { AppState } from '../../app.reducer';
import { IngresoEgreso } from '../ingreso-egreso.model';
import { Subscription } from 'rxjs';
import { IngresoEgresoService } from '../ingreso-egreso.service';

import Swal from 'sweetalert2';

import * as fromIngresoEgreso from '../ingreso-egreso.reducer';
import { AuthService } from 'src/app/auth/auth.service';

@Component({
  selector: 'app-detalle',
  templateUrl: './detalle.component.html',
  styles: []
})
export class DetalleComponent implements OnInit, OnDestroy {

  items: IngresoEgreso[];
  subscription: Subscription = new Subscription();

  constructor( private store: Store<AppState>,
               private ingresoEgresoService: IngresoEgresoService,
               private auth: AuthService) { }

  ngOnInit() {
    this.subscription = this.store.select('ingresoEgreso')
        .subscribe( ingresoEgreso => {
          this.items = ingresoEgreso.items;
        });

        const { uid } = this.auth.getUsuario();

        this.subscription = this.ingresoEgresoService.ingresoEgresoItems(uid)
  }

  ngOnDestroy() {
    this.subscription.unsubscribe();
  }

  borrarItem( item: IngresoEgreso ) {
    this.ingresoEgresoService.borrarIngresoEgreso( item.uid )
        .then( () => {
          Swal.fire('Eliminado', item.descripcion, 'success');
        });
  }

}
