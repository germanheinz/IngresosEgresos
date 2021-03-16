import { Injectable } from '@angular/core';


import 'firebase/firestore';
import { AngularFirestore } from '@angular/fire/firestore';

import { AngularFireAuth } from '@angular/fire/auth';

import { Router } from '@angular/router';

import { Store } from '@ngrx/store';
import { ActivarLoadingAction,
         DesactivarLoadingAction } from '../shared/ui.accions';


import * as firebase from 'firebase';
import { map } from 'rxjs/operators';

import Swal from 'sweetalert2';
import { User } from './user.model';

import { AppState } from '../app.reducer';
import { Subscription } from 'rxjs';
import * as authActions from './auth.actions';
import * as ingresoEgresoActions from '../ingreso-egreso/ingreso-egreso.actions';

import { IngresoEgreso } from '../ingreso-egreso/ingreso-egreso.model';
import { THIS_EXPR } from '@angular/compiler/src/output/output_ast';


@Injectable({
  providedIn: 'root'
})
export class AuthService {

  private userSubscription: Subscription = new Subscription();
  private usuario: User;
  private uid: string; 

  constructor( private afAuth: AngularFireAuth,
               private router: Router,
               private afDB: AngularFirestore,
               private store: Store<AppState>) { }


  initAuthListener() {

    this.afAuth.authState.subscribe( (fbUser: firebase.User) => {

      if ( fbUser ) {

        this.userSubscription = this.afDB.doc(`${ fbUser.uid }/usuario`).valueChanges()
                .subscribe( (usuarioObj: any) => {

                  const newUser = new User( usuarioObj );
                  this.store.dispatch( new authActions.SetUserAction( newUser ) );
                  this.usuario = newUser;

                });

                
      } else {

        this.usuario = null;
        this.userSubscription.unsubscribe();
        this.store.dispatch( new authActions.UnsetUserAction() );
        this.store.dispatch( new ingresoEgresoActions.unsetItemsAction() );

      }

    });

  }


  crearUsuario( nombre: string, email: string, password: string ) {

    this.store.dispatch( new ActivarLoadingAction()  );

    this.afAuth
        .createUserWithEmailAndPassword(email, password)
        .then( resp => {

          // console.log(resp);
          const user: User = {
            uid: resp.user.uid,
            nombre: nombre,
            email: resp.user.email
          };

          this.afDB.doc(`${ user.uid }/usuario`)
              .set( user )
              .then( () => {

                this.router.navigate(['/']);
                this.store.dispatch( new DesactivarLoadingAction()  );

              });


        })
        .catch( error => {
          console.error(error);
          this.store.dispatch( new DesactivarLoadingAction()  );
          Swal.fire('Error en el login', error.message, 'error');
        });


  }


  login( email: string, password: string ) {


    this.store.dispatch( new ActivarLoadingAction()  );

    this.afAuth
        .signInWithEmailAndPassword(email, password)
        .then( resp => {

          console.log(resp.user.uid);
          this.uid = resp.user.uid;
          console.log(this.uid);
          
          this.store.dispatch( new DesactivarLoadingAction()  );
          this.router.navigate(['/']);

        })
        .catch( error => {
          console.error(error);
          this.store.dispatch( new DesactivarLoadingAction()  );
          Swal.fire('Error en el login', error.message, 'error');
        });
  }

  logout() {

    this.router.navigate(['/login']);
    this.afAuth.signOut();

    this.store.dispatch( new ingresoEgresoActions.unsetItemsAction() );
    this.store.dispatch( new authActions.UnsetUserAction() );

  }


  isAuth() {
    return this.afAuth.authState
        .pipe(
          map( fbUser => {

            if ( fbUser == null ) {
              this.router.navigate(['/login']);
            }

            return fbUser != null;
          })
        );
  }

  getUsuario() {
    return { ...this.usuario };
  }

}
