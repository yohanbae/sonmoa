import { Component } from '@angular/core';
import { AngularFireAuth } from '@angular/fire/auth';
import {AngularFirestore,
  AngularFirestoreDocument,
  AngularFirestoreCollection
} from '@angular/fire/firestore';
import {Observable, of} from 'rxjs';
import {switchMap, map, count, flatMap} from 'rxjs/operators';
import {User} from '../user.model';
import {Friend} from '../friend.model';

import { FirebaseUISignInSuccessWithAuthResult } from 'firebaseui-angular';

import { UsersService } from '../users.service';

@Component({
  selector: 'app-tabs',
  templateUrl: 'tabs.page.html',
  styleUrls: ['tabs.page.scss']
})
export class TabsPage {

  users;

  constructor(private theUsers:UsersService) {

    this.users = theUsers.getUsers();

  }
  onSignOut(){
    this.theUsers.signOut();
  }




}
