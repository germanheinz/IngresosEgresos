import { Component, OnInit } from '@angular/core';
import { Store } from '@ngrx/store';
import { AppState } from '../../app.reducer';
import { Subscription } from 'rxjs';
import { IngresoEgreso } from '../ingreso-egreso.model';

import * as fromIngresoEgreso from '../ingreso-egreso.reducer';
import { IngresoEgresoService } from '../ingreso-egreso.service';
import { AuthService } from 'src/app/auth/auth.service';


@Component({
  selector: 'app-estadistica',
  templateUrl: './estadistica.component.html',
  styles: []
})
export class EstadisticaComponent implements OnInit {

  ingresos: number;
  egresos: number;

  cuantosIngresos: number;
  cuantosEgresos: number;

  subscription: Subscription = new Subscription();

  public doughnutChartLabels: string[] = ['Ingresos', 'Egresos'];
  public doughnutChartData: number[] = [];
  items: IngresoEgreso[];
  uid: string;

  constructor( private store: Store<fromIngresoEgreso.AppStateIngresos>, private ingresoEgresoService: IngresoEgresoService, private auth: AuthService ) { }

  ngOnInit() {
    this.subscription = this.store.select('ingresoEgreso')
            .subscribe( ingresoEgreso => {
              this.contarIngresoEgreso( ingresoEgreso.items );
            });

            const { uid } = this.auth.getUsuario();
            this.uid = uid;
            console.log(uid);
            this.ingresoEgresoService.initIngresosEgresosListener(this.uid);

    this.subscription = this.ingresoEgresoService.ingresoEgresoItems(uid);

  }

  contarIngresoEgreso( items: IngresoEgreso[] ) {

    this.ingresos = 0;
    this.egresos = 0;

    this.cuantosEgresos = 0;
    this.cuantosIngresos = 0;

    items.forEach( item => {

      if ( item.tipo === 'ingreso' ) {
        this.cuantosIngresos ++;
        this.ingresos += item.monto;
      } else {
        this.cuantosEgresos ++;
        this.egresos += item.monto;
      }

    });

    this.doughnutChartData = [ this.ingresos, this.egresos ];

  }

}
