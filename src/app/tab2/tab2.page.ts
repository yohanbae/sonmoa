import { Component, OnInit } from '@angular/core';
import { UsersService } from '../users.service';
import { Observable } from 'rxjs';
import {Friend} from '../friend.model';
import {User} from '../user.model';
import { AngularFireAuth } from '@angular/fire/auth';
import {AngularFirestore,
  AngularFirestoreDocument,
  AngularFirestoreCollection
} from '@angular/fire/firestore';
import {switchMap, map, count, flatMap} from 'rxjs/operators';
import { FirebaseUISignInSuccessWithAuthResult } from 'firebaseui-angular';
import { Router } from '@angular/router';

import { AlertController } from '@ionic/angular';



@Component({
  selector: 'app-tab2',
  templateUrl: 'tab2.page.html',
  styleUrls: ['tab2.page.scss']
})
export class Tab2Page implements OnInit {
  // //User Information
  // usersCol: AngularFirestoreCollection<User>;
  // users: Observable<User[]>;
  // userDoc: AngularFirestoreDocument<User>;  
  // user: User = {
  //   displayName: "",
  //   email: "",
  //   uid: ""
  // }
  // private authState: Observable<firebase.User>


  // //Friend Information
  // friendsCol: AngularFirestoreCollection<Friend>;
  // friends: Observable<Friend[]>;
  // friendDoc: AngularFirestoreDocument<Friend>;
  // friend: Friend = {
  //   displayName: "",
  //   uid: "",
  //   friends:[
  //     {status:"", displayName:"", uid:"", email:""}
  //   ]
  // }

  // // Store My Friend List
  // myFriendList;

  // User UID *Important
  uid:any;  name:any;  email:any;

  // user$: Observable<User>;
  // userNumber:number; // Total Number of Current User

  // Detect if new Firebase data updated for Users
  showTotalUserNumberBox = false; // Display Total User Numbers when Fetching is Done
  begin_setup = false;
  showUpdatedSign = false;

  // Friend Search
  findFriendData:any = null;
  findFriendDataExist = false;
  friendWaitingNumber:number;

  // CONFIGURATION END
  constructor(private theUsers:UsersService, private afs: AngularFirestore, public afAuth: AngularFireAuth, public alertController: AlertController,
    private router: Router
    ) {
  }// CONSTRUCTOR END

  ngOnInit(){
    this.theUsers.getSetup_Tab2();

  }

  ionViewWillEnter(){
    this.theUsers.getSetup_Tab2();

  }


  successCallback(signInSuccessData: FirebaseUISignInSuccessWithAuthResult){
    this.theUsers.getSetup_Tab2();

  }

  // // I NEED THIS HERE :: to run DB on REALTIME
  // async getMyFriendList(){ // Refactored
  //   // TRIGGERED AT CONSTRUCTOR & SUCCESS LOGIN
  //   this.friendsCol = this.afs
  //   .collection('user_friend_list', ref=>ref);

  //   this.friends = this.friendsCol.snapshotChanges().pipe(map(changes =>{
  //     const change = changes.map(a => {
  //       const data = a.payload.doc.data() as Friend;
  //       data.uid = a.payload.doc.id;
  //       return data;
  //     });
  //     return change;
  //   }));
  //   let results;

  //   this.friends.subscribe(data=>{
  //     data.find((obj) => {
  //       if(obj.uid == this.uid) { 
  //         results = obj; 
  //         console.log(obj);
  //       }
  //       return false;
  //     });
  //     console.log('then 1 ', this.uid);

  //     if(results){
  //       this.myFriendList = results.friends;

  //       // Get Total Number of Friend Waiting For Accept
  //       if(results!=null){
  //         let meme = results.friends.filter(i => i.status === 'received');
  //         this.friendWaitingNumber = meme.length;
  //       }        
  //     }else{
  //       this.myFriendList = [];
  //     }
  //   });
  // }

  goTest(){
    return this.theUsers.myFriends;
  }

  // FRIEND CONTROL //
  onFindFriend(){ // Refactored
    this.theUsers.findFriend()
      .then((obj) => {
        this.findFriendData = obj;
      });
  }
  getFriendWaitingNumber(){
    return this.theUsers.friendWaitingNumber;
  }

  onSendFriendRequest(uid, name, email){ // Refactored
  
    this.theUsers.sendFriendRequest(uid, name, email);
    this.findFriendData = null;

  } // Function End

  onAcceptFriend(uid, name, email){ // Refactored
    this.theUsers.acceptFriend(uid, name, email);
  }
  onBlockFriend(uid){
    // change my friend list status to block
    // then, put HIS uid to my prayer list
    // on His View, if he find the uid from my prayer list, then he won't able to bring it.
  }

  async onDenyFriend(uid, name, email){
    const alert = await this.alertController.create({
      header: 'Confirm!',
      message: 'Are you sure you want to deny invitation?',
      buttons: [
        {
          text: 'Cancel',
          role: 'cancel',
          handler: (blah) => {
            console.log('Confirm Cancel: blah');
          }
        }, {
          text: 'Okay',
          // cssClass: 'secondary2',
          handler: () => {
            this.theUsers.denyFriend(uid, name, email);
          }
        }
      ]
    });

    await alert.present();

  }


  async presentAlertConfirm() {

  }

  onMoveLogin(){
    this.router.navigate(['/tabs/tab4']);
  }

  myFriendPrayer:any = [];
  onView(uid, displayName){
    this.theUsers.getTotalFriendPrayerList()
      .then((result)=>{
        this.myFriendPrayer = result;
        console.log('My Friend Prayer', this.myFriendPrayer);
        let meme = this.myFriendPrayer.find(obj=>{
          return obj.uid == uid;
        });
        if(meme.prayers.length > 0){
          this.myFriendPrayer = meme.prayers;
        } else{
          this.myFriendPrayer[0].prayer = "공유된 기도제목이 없습니다";
        }
        this.name = displayName;
        console.log(meme);
    });  

    let thedoc = document.querySelector('.display-wrap') as HTMLElement;
    setTimeout(function () {
      thedoc.classList.add('display-wrap-on');
    }, 20);
    thedoc.style.display="block";
  }

  closeDisplay(){
    let thedoc = document.querySelector('.display-wrap') as HTMLElement;
    setTimeout(function () {
      thedoc.style.display="none";    
    }, 500);
    thedoc.classList.remove('display-wrap-on');
  }
  
  showSetup(uid, shared){

  }
  


  
  // Filter for the 'Friend Requested'
  filterRequest(your_collection): any[] {  
    return this.theUsers.myFriendList.filter(i => i.status === 'request');
  }
  filterReceived() {  
    return this.theUsers.myFriendList.filter(i => i.status === 'received');
  }
  filterFriend() {  
    return this.theUsers.myFriendList.filter(i => i.status === 'friend');
  }  




//   successCallback(signInSuccessData: FirebaseUISignInSuccessWithAuthResult) {
// //     this.usersCol = this.afs
// //     .collection('users', ref=>ref);

// //     this.users = this.usersCol.snapshotChanges().pipe(map(changes =>{
// //       const change = changes.map(a => {
// //         const data = a.payload.doc.data() as User;
// //         data.uid = a.payload.doc.id;
// //         return data;
// //       });

// //       // if(!this.begin_setup){
// //       //   this.userNumber = change.length;
// //       //   this.begin_setup = true;
// //       // }else{
// //       //   if(this.userNumber != change.length){
// //       //     this.showUpdatedSign = true;
// //       //     this.userNumber = change.length;
// //       //     setTimeout(() => {
// //       //       this.showUpdatedSign = false;
// //       //     }, 5000);          
// //       //   }
// //       // }
// //       return change;
// // //      this.checkUserNeedMoreInput(signInSuccessData.authResult.user.uid);
// //     }));
// //     this.getMyFriendList();
//     console.log('logedin');
//   }



}
