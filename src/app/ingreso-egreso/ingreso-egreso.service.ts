import { Injectable } from '@angular/core';

//import { AngularFirestore } from 'angularfire2/firestore';

import 'firebase/firestore';
import { AngularFirestore } from '@angular/fire/firestore';

import { IngresoEgreso } from './ingreso-egreso.model';
import { AuthService } from '../auth/auth.service';
import { Store } from '@ngrx/store';
import { AppState } from '../app.reducer';
import { filter, map } from 'rxjs/operators';
import { setItemsAction, unsetItemsAction } from './ingreso-egreso.actions';
import { Subscription } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class IngresoEgresoService {

  ingresoEgresoListerSubcription: Subscription = new Subscription();
  ingresoEgresoItemsSubcription: Subscription = new Subscription();


  constructor( private afDB: AngularFirestore,
               public authService: AuthService,
               private store: Store<AppState>) { }

  ingresoEgresoItems( uid: string ) {

    return this.ingresoEgresoItemsSubcription = this.afDB.collection(`${ uid }/ingresos-egresos/items`)
             .snapshotChanges()
             .pipe(
               map(  docData => {

                return docData.map( doc => {
                  return {
                    uid: doc.payload.doc.id,
                    ...doc.payload.doc.data() as any
                  };
                });

               })
             )
             .subscribe( (coleccion: any[]) => {

              this.store.dispatch( new setItemsAction(coleccion) );

             });


  }

  initIngresosEgresosListener(uid: string) {

    return this.afDB.collection(`${ uid }/ingresos-egresos/items`)
      .snapshotChanges()
      .pipe(
        map( snapshot => snapshot.map( doc => ({
              uid: doc.payload.doc.data,
              ...doc.payload.doc.data() as any
            })
          )
        )
      );
  }

  cancelarSubscriptions() {
    this.store.dispatch( new unsetItemsAction() );
    this.ingresoEgresoListerSubcription.unsubscribe();
    this.ingresoEgresoItemsSubcription.unsubscribe();
  }


  crearIngresoEgreso( ingresoEgreso: IngresoEgreso ) {

    const user = this.authService.getUsuario();

    return this.afDB.doc(`${ user.uid }/ingresos-egresos`)
            .collection('items').add({...ingresoEgreso});
  }

  borrarIngresoEgreso( uid: string ) {

    const user = this.authService.getUsuario();

    return this.afDB.doc(`${ user.uid }/ingresos-egresos/items/${ uid }`)
               .delete();

  }


}
