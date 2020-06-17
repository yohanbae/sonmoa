import { Component, OnInit } from '@angular/core';
import { AngularFirestore, AngularFirestoreDocument} from '@angular/fire/firestore';
// import {auth} from 'firebase/app';
import { Router } from '@angular/router';

import {AngularFireAuth} from '@angular/fire/auth';
import {Observable, of} from 'rxjs';
// import { AuthService } from '../services/auth.service';

import {switchMap} from 'rxjs/operators';
import {User} from '../user.model';
import { UsersService } from '../users.service';

import { Storage } from '@ionic/storage';

@Component({
  selector: 'app-login',
  templateUrl: './login.page.html',
  styleUrls: ['./login.page.scss'],
})
export class LoginPage implements OnInit {
  error:any;
  user$: Observable<User>;
  loginOn:boolean = true;


  email:string;
  password:string;
  errorMessage:string;
  errorMessage2:string;

  email2:string;
  password2:string;
  displayName2:string;
  uid;
  constructor(
    private afAuth: AngularFireAuth,
    private afs: AngularFirestore,
    private router: Router,
    private theUsers:UsersService,
    private storage: Storage
  ) {
    this.user$ = this.afAuth.authState.pipe(
      switchMap(user => {
        if(user){
          console.log(user);
          return this.afs.doc<User>(`users/${user.uid}`).valueChanges();
        }else{
          return of(null);
        }
      })
    );        
   }

  ngOnInit() {
    document.addEventListener("backbutton", onBackKeyDown, false);  
    function onBackKeyDown(e) { 
       e.preventDefault(); 
       alert('Back Button is Pressed!'); 
    }
  }

  onMode(){
    if(this.loginOn){
      this.loginOn = false;
    }else{
      this.loginOn = true;
    }
  }

  myLogin(){
    if(this.email && this.password){
      this.afAuth.auth.signInWithEmailAndPassword(
        this.email,
        this.password).then(
          (success) => {
            console.log(success);
            return this.router.navigate(['/']);
          }
        )
        .catch(error=>{
          this.errorMessage = "Please enter correct information";
          console.log(error.message);
        });
    }else{
      this.errorMessage = "Please enter correct information";      
    }

  }  

  async signOut(){
    await this.afAuth.auth.signOut();
    return this.router.navigate(['/']);
  }

  onForgot(){
    console.log('i forgot');
    this.afAuth.auth.sendPasswordResetEmail('gentlebae@gmail.com').then(
      (success) => {
        console.log(success);
      }
    )
  }

  onCreate(){

    if(this.email2 && this.displayName2 && this.password2){
      this.creating()
      .then(result=>{
        console.log('PLZ ', result);
        this.theUsers.getSetup_FirstUser(this.uid, this.displayName2, this.email2);
        this.theUsers.checkIfErrorOccur();
        this.router.navigate(['/']);    

      });
    }else{
      this.errorMessage2 = "Please enter correct information";
    }
  }

  creating(){
    return new Promise((resolve, reject)=>{
      this.afAuth.auth.createUserWithEmailAndPassword(this.email2, this.password2)
      .then(async (userData) => {
        console.log('Success ', userData);
        // if sucessful, then enter the other user information
        userData.user.updateProfile({
          displayName: this.displayName2
        })
        .then((result)=>{
          //this.updateUserData(userData.user);
          this.uid = userData.user.uid;
          console.log('HEHE', result);
          resolve(userData);
        });

//        const credential = await this.afAuth.auth.signInWithEmailAndPassword(this.email2, this.password2);

        // this.updateUserData({uid:credential.user.uid, email:this.email2, displayName:this.displayName2});
        // resolve(credential);
        }
      )
      .catch(error => {
        this.errorMessage2 = "Please enter correct information";
      });    
    });

  }

  saving:string;
  onSaveStorage(){
    this.saving = 'Yohani Saved';
    this.storage.set('name', 'Yohani');
  }

  onLoadStorage(){
    this.storage.get('name')
    .then((val) => {
      console.log('We found name', val);
      this.saving = val;
    })
    .catch((error => {
      this.saving = "No Data";
    }));
  }

  onClear(){
    this.storage.clear();
      this.saving = "All Data Cleared";

  }  

  // private updateUserData({uid, email, displayName}: User){
  //   console.log('data updating ', displayName);
  //   const userRef: AngularFirestoreDocument<User> = this.afs.doc(`users/${uid}`);
  //   const data = {
  //     uid,
  //     email,
  //     displayName
  //   }
  //   return userRef.set(data, {merge: true});
  // }


}
