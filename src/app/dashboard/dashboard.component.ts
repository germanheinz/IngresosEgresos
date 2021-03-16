import { Component, OnDestroy, OnInit } from '@angular/core';
import { Store } from '@ngrx/store';
import { Subscription } from 'rxjs';
import { filter } from 'rxjs/operators';
import { AppState } from '../app.reducer';
import { AuthService } from '../auth/auth.service';

import * as ingresosEgresosActions from '../ingreso-egreso/ingreso-egreso.actions';

import { IngresoEgreso } from '../ingreso-egreso/ingreso-egreso.model';
import { IngresoEgresoService } from '../ingreso-egreso/ingreso-egreso.service';

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styles: []
})
export class DashboardComponent implements OnInit, OnDestroy {

  
  items: IngresoEgreso[];
  subscription: Subscription = new Subscription();
  userSubscription: Subscription;
  ingresosSubscription: Subscription;
  uid: string;

  constructor( public ingresoEgresoService: IngresoEgresoService, 
               private store: Store<AppState>) {}

  ngOnInit() {

    this.userSubscription = this.store.select('auth')
    .pipe(
      filter(auth => auth.user != null )
    )
    .subscribe(({user}) => {
      console.log(user);
      this.ingresosSubscription = this.ingresoEgresoService.initIngresosEgresosListener(user.uid)
      .subscribe(ingresosEgresosFB => {
        console.log(ingresosEgresosFB);
        this.store.dispatch( new ingresosEgresosActions.setItemsAction(ingresosEgresosFB) )
      })
    });

    this.subscription = this.store.select('ingresoEgreso')
    .subscribe( ingresoEgreso => {
      this.items = ingresoEgreso.items;
    });
  }

  ngOnDestroy(){
    this.userSubscription.unsubscribe();
    this.ingresosSubscription.unsubscribe();
  }

}
