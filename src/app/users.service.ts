import { Injectable } from '@angular/core';
import { AngularFireAuth } from '@angular/fire/auth';
import {AngularFirestore,
  AngularFirestoreDocument,
  AngularFirestoreCollection
} from '@angular/fire/firestore';
import {Observable, of} from 'rxjs';
import {switchMap, map, count, flatMap} from 'rxjs/operators';
import {User} from './user.model';
import {Friend} from './friend.model';

import { FirebaseUISignInSuccessWithAuthResult } from 'firebaseui-angular';
import { FriendPrayer } from './friendprayer.model';

import { Group } from './group.model';
import { UserGroup } from './usergroup.model';
import * as firebase from 'firebase';

@Injectable({
  providedIn: 'root'
})
export class UsersService {
  //User Information
  usersCol: AngularFirestoreCollection<User>;
  users: Observable<User[]>;
  userDoc: AngularFirestoreDocument<User>;  
  user: User = {
    displayName: "",
    email: "",
    uid: ""
  }

  //Friend Information
  friendsCol: AngularFirestoreCollection<Friend>;
  friends: Observable<Friend[]>;
  friendDoc: AngularFirestoreDocument<Friend>;
  friend: Friend = {
    displayName: "",
    uid: "",
    friends:[
      {status:"", displayName:"", uid:"", email:""}
    ]
  }

  // Store My Friend List & Target's Friend List
  myFriends=[];
  myFriendList:any = [];
  hisFriendList;

  //Friend Information
  hisFriendsCol: AngularFirestoreCollection<Friend>;
  hisFriends: Observable<Friend[]>;
  hisFriendDoc: AngularFirestoreDocument<Friend>;
  hisFriend: Friend = {
    displayName: "",
    uid: "",
    friends:[
      {status:"", displayName:"", uid:"", email:""}
    ]
  }

  myFriendPrayer;
  myFriendPrayerList;
  friendPrayersCol: AngularFirestoreCollection<FriendPrayer>;
  friendPrayers: Observable<FriendPrayer[]>;
  friendPrayerDoc: AngularFirestoreDocument<FriendPrayer>;
  friendPrayer: FriendPrayer = {
    uid:"",
    shared:"",
    prayer:"",
    displayName:"",
    date:"",
    status:"",
    datecode:""
  }



  uid:any; // User UID *Important
  name:any;
  email:any;

  studentExist:boolean = false;

  user$: Observable<User>;
  userNumber:number; // Total Number of Current User

  // Detect if new Firebase data updated for Users
  showTotalUserNumberBox = false; // Display Total User Numbers when Fetching is Done
  begin_setup = false;
  showUpdatedSign = false;


  // Friend Search
  findFriendData:any = null;
  findFriendDataExist = false;
  showFriendUpdatedSign=false;
  friendWaitingNumber:number;


  errorOccured = false;

  // Check if SetupTab Loaded
  getSetup_Tab1_Loaded:boolean = false;  
  getSetup_Tab2_Loaded:boolean = false;
  getSetup_Tab3_Loaded:boolean = false;

  // CONFIGURATION END

  constructor(public afAuth: AngularFireAuth, private afs: AngularFirestore) { 
    console.log('SERVICE');
    this.usersCol = this.afs
      .collection('users', ref=>ref);

    // Get USER LIST from Firebase
    // this.users = this.usersCol.snapshotChanges().pipe(map(changes =>{
    //   const change = changes.map(a => {
    //     const data = a.payload.doc.data() as User;
    //     data.uid = a.payload.doc.id;
    //     return data;
    //   });
    


    this.setupUsers()
      .then(
        (result) => {
        console.log('the result ', result);
        // GET MY USER LOGIN INFORMATION 
        this.user$ = this.afAuth.authState.pipe();
        this.checkIfErrorOccur();
        },
        (error) => {
          console.log('Eror Occured!', error);
          this.errorOccured = true;
        }
      );



      // if(!this.begin_setup){
      //   this.userNumber = change.length;
      //   this.begin_setup = true;
      // }else{
      //   if(this.userNumber != change.length){
      //     this.showUpdatedSign = true;
      //     this.userNumber = change.length;
      //     setTimeout(() => {
      //       this.showUpdatedSign = false;
      //     }, 5000);          
      //   }
      // }
      //return change;
    // }));




    // GET My Friend LIST // Fired After LOGIN
    //this.getMyFriendList(); // Moved to tab2


  } // CONSTRUCTOR END

  getSetup_FirstUser(uid, displayName, email){
    // create DB
    // This one loaded from LOGIN.PAGE.TS

    this.createUser(uid, displayName, email);
    this.createUserFrinedList(uid, displayName, email);
    this.createFriendPrayer(uid, displayName, email);
    this.createUserGroup(uid, displayName, email); // Need to be added Later / for Community
  }

  getSetup_Tab3(){
    // CONFIRM IF USER LOGGED IN ** FINAL PERFECT CODE!!
    new Promise((resolve, reject) => {
      const unsubscribe = this.afAuth.auth.onAuthStateChanged(user => {
        unsubscribe();
        if(user){
          resolve(user);
        }else{
          reject();          
        }
      }, reject);      
    })
    .then(result=> {
      this.friendsCol = this.afs
      .collection('user_friend_list', ref=>ref);

      this.friends = this.friendsCol.snapshotChanges().pipe(map(changes =>{
        const change = changes.map(a => {
          const data = a.payload.doc.data() as Friend;
          data.uid = a.payload.doc.id;
          return data;
        });
        return change;
      }));
      

      this.friends.subscribe(data=>{
        let results= data.find((obj) => {
          return obj.uid == this.uid;
          // if(obj.uid == this.uid) { 
          //   results = obj; 
          //   console.log(obj);
          // }
          // return false;
        });
        console.log('then 1 ', this.uid);

        if(results){
          this.myFriendList = results.friends;    
        }else{
          this.myFriendList = [];
        }
      });

      // myUserGroup :: 내가 속해있는 그룹 리스트 : 내가 속한 리스트
      this.userGroupsCol = this.afs
        .collection('user_group', ref=>ref);
      this.userGroups = this.userGroupsCol.snapshotChanges().pipe(map(changes =>{
        const change = changes.map(a => {
          const data = a.payload.doc.data() as UserGroup;
          data.uid = a.payload.doc.id;
          return data;
        });
        return change;
      }));  

      this.userGroups.subscribe(data=>{
        this.myUserGroup = data;
        //this.filterMyOwnGroup(data);

        //내가 Owner/Admin으로 있는 그룹 찾기
        let mine = data.find(obj=>{
          return obj.uid == this.uid;
        })
        let result = [];       
        let result_member = [];
        let result_invited = [];

        mine.group.find(obj=>{
          if(obj.role == "owner" || obj.role=="admin"){
            result.push(obj);
          }else if(obj.role == "member"){
            result_member.push(obj);
          }else if(obj.role == "invited"){
            result_invited.push(obj);
          }
          return false;
        });      
        this.myUserGroup_Owner = result;
        this.myUserGroup_Member = result_member;
        this.myUserGroup_Invited = result_invited;
        this.invitedNumber = result_invited.length;
        console.log('ONWER ', this.myUserGroup_Owner);
      });    

      // myGroupList :: 전체 그룹리스트 : 기도제목은 여기에 있다
      this.groupListsCol = this.afs
        .collection('group', ref=>ref);
      this.groupLists = this.groupListsCol.snapshotChanges().pipe(map(changes =>{
        const change = changes.map(a => {
          const data = a.payload.doc.data() as Group;
          data.groupUid = a.payload.doc.id;
          return data;
        });
        return change;
      }));  

      this.groupLists.subscribe(data=>{
        this.myGroupList = data;
      });  
      this.getSetup_Tab3_Loaded = true;
    })
    .catch(error => {
      console.log('NOT LOGGED YET ', error);
    });
    
  } // Tab3 Done

  // checkOwnerService(groupUid){
  //   let result = this.myUserGroup.find(obj=>{
  //     return (obj.uid == this.uid);
  //   })
  //   //result.group
  //   let meme = result.group.find(obj=>{
  //     return obj.groupUid == groupUid;
  //   });
    
  // }


  getSetup_Tab2(){
    this.friendsCol = this.afs
    .collection('user_friend_list', ref=>ref);

    this.friends = this.friendsCol.snapshotChanges().pipe(map(changes =>{
      const change = changes.map(a => {
        const data = a.payload.doc.data() as Friend;
        data.uid = a.payload.doc.id;
        return data;
      });
      return change;
    }));
    //let results;

    this.friends.subscribe(data=>{
      let results = data.find((obj) => {
        return obj.uid == this.uid;
        // if(obj.uid == this.uid) { 
        //   results = obj; 
        //   console.log(obj);
        //}
        //return false;
      });
      console.log('then 1 ', this.uid);

      if(results){
        this.myFriendList = results.friends;

        // Get Total Number of Friend Waiting For Accept
        if(results!=null){
          let meme = results.friends.filter(i => i.status === 'received');
          this.friendWaitingNumber = meme.length;
        }        
      }else{
        this.myFriendList = [];
      }
      this.getSetup_Tab2_Loaded = true;
    });
  }

  getSetup_Tab1(){  // SETUP FOR TAB1
    // CONFIRM IF USER LOGGED IN ** FINAL PERFECT CODE!!
    new Promise((resolve, reject) => {
      const unsubscribe = this.afAuth.auth.onAuthStateChanged(user => {
        unsubscribe();
        if(user){
          resolve(user);
        }else{
          reject();          
        }
      }, reject);      
    })
    .then(result=> {
      console.log('must this ', this.afAuth.auth.currentUser.uid);

      //Total Friend List
      this.friendsCol = this.afs
        .collection('user_friend_list', ref=>ref);

      this.friends = this.friendsCol.snapshotChanges().pipe(map(changes =>{
        const change = changes.map(a => {
          const data = a.payload.doc.data() as Friend;
          data.uid = a.payload.doc.id;
          return data;
        });
        return change;
      }));

      // GET MY FRIEND USING MY UID
      this.friends.subscribe(data=>{
        let results = data.find((obj) => {
          return obj.uid == this.uid;
        });
        this.myFriends = results.friends;  
        console.log('This is my Friend List', this.myFriends);

        this.friendPrayersCol = this.afs
        .collection('friend_prayer', ref=>ref);
    
        // this has list of friend_prayer user
        this.friendPrayers = this.friendPrayersCol.snapshotChanges().pipe(map(changes =>{
          const change = changes.map(a => {
            const data = a.payload.doc.data() as FriendPrayer;
            data.uid = a.payload.doc.id;
            return data;
          });
          return change;
        }));
  
        // Total List of Friend PRayerList:: Subscribed Ver.
        this.friendPrayers.subscribe(data=>{
          this.myFriendPrayer = data;
          console.log('MY FRIEND PRAYER LIST', this.myFriendPrayer);

          let datas = [];
          this.myFriends.map((obj) =>{
            this.myFriendPrayer.find((fri) => {
              if(fri.uid == obj.uid){
                datas.push(fri);
              }
              return false;
              });
            return false;
          });
          let thethe = [];
          console.log('thethe ', datas);
          datas.map((obj) => {
            obj.prayers.map((the) => {
              thethe.push(the);
              return false;
            });
            console.log('final', thethe);
            this.myFriendPrayerList = thethe;
            return thethe;
          });
          return thethe;       

        });
        /// FRIEND PART ALL DONE

        // START USERGROUP PART
    //Get Group Info That I belong
    this.userGroupsCol = this.afs
      .collection('user_group', ref=>ref);
    this.userGroups = this.userGroupsCol.snapshotChanges().pipe(map(changes =>{
      const change = changes.map(a => {
        const data = a.payload.doc.data() as UserGroup;
        data.uid = a.payload.doc.id;
        return data;
      });
      return change;
    }));  

    this.userGroups.subscribe(data=>{
      this.myUserGroup = data;
      console.log('WHAT I WANT TOTAL GROUP LIST BY USER', data); 

      // Get Total Group Info
      this.groupListsCol = this.afs
        .collection('group', ref=>ref);
      this.groupLists = this.groupListsCol.snapshotChanges().pipe(map(changes =>{
        const change = changes.map(a => {
          const data = a.payload.doc.data() as Group;
          data.groupUid = a.payload.doc.id;
          return data;
        });
        return change;
      }));  

      this.groupLists.subscribe(data=>{
        this.myGroupList = data;
        console.log('WHAT I WANT TOTAL GROUP LIST', data);

        let myGroup = [];
        this.myUserGroup.find(obj=>{
          if(obj.uid == this.uid){
    
            obj.group.find(the=>{
              this.myGroupList.find(data=>{
    
                if(the.groupUid == data.groupUid){
                  
                  if(data.prayer!=null){
                    data.prayer.map(row=>{
                      row['groupName'] = the.groupName;
                      myGroup.push(row);
                    });
                  }
    
                }
              });
            });
    
    
          }
        });
        //return myGroup;
        this.myGroupPrayerFinal = myGroup;
        this.getSetup_Tab1_Loaded = true;
      });     
    });


  });

    })
    .catch(error => {
      console.log('NOT LOGGED YET ', error);
    });
    
  }


  checkIfErrorOccur(){ // 이거는 유저정보 정리로 이름 바꾸는게 필요할ㄷ스
    this.user$
    .subscribe(data => {
      if(data){
        this.uid = data.uid;
        this.name = data.displayName;
        this.email = data.email;
        // if(!this.errorOccured){
        //   console.log('No Error. Run checkUserNeedMoreInput');
        //   //this.checkUserNeedMoreInput(this.uid);
        // }else{
        //   console.log('Error found. Do nothing');
        //   //this.errorOccured = false;
        // }
        console.log('error checked', this.name, this.email);
      }
    });
    // const credential = await this.afAuth.auth.signInWithEmailAndPassword(this.email2, this.password2);
    //     this.uid = credential.user.uid;
    //     this.name = credential.user.displayName;
    //     this.email = credential.user.email;
    // console.log('Error Part', credential.user.displayName);
  }



  setupUsers(){
    return new Promise((resolve, reject) => {
      this.users = this.usersCol.snapshotChanges().pipe(map(changes =>{
        const change = changes.map(a => {
          const data = a.payload.doc.data() as User;
          data.uid = a.payload.doc.id;
          return data;
        });
        return change;
      }));
      this.users.subscribe((data)=>{
        console.log('focus! ', data);
        if(data.length <= 0){ 
          this.errorOccured = true;
          console.log('error recorded');
        }
        return false;
      });
      if(this.errorOccured){
        reject('nono');
      }else{
        resolve(this.users);
      }

    });      
  }


  getUsers(){
    return this.users;
  }

  theusers;
  moveTheusers(data){
    this.theusers = data;
  }


  checkUserNeedMoreInput(uid){
    // Check if Users has User UID  
    console.log('this uid', uid);
    new Promise((resolve, reject) => {
      this.users.subscribe(data => {
        let count = 0;
        data.find(function(obj){
          if(obj.uid == uid){
            count++;
          }
          return false;
        });
        console.log(count);
        resolve(count);        
      });
    })
    .then(
      (result) =>{
        if(result == 0){
          console.log('!!!!!!!!!!NO Data yet, Move to ADD More information Page');

          console.log('NOT GOING TO CREATE NEW DATA. BUT YOU NEED TO FIX THIS PART!!!!')
          // this.createUser();
          // this.createUserFrinedList();
          // this.createFriendPrayer();
          // this.createUserGroup(); // Need to be added Later / for Community
        }else {
          console.log('!!!!!!!!!Data Yes, stay on the track');
        }
        this.showTotalUserNumber();   
      }
    )
 
    
  }

  showTotalUserNumber(){
    this.showTotalUserNumberBox = true;
  }

  // successCallback(signInSuccessData: FirebaseUISignInSuccessWithAuthResult) {
  //   console.log('okkkkkkkkkkkkkkkkk');
  // }

  signOut(){
    this.afAuth.auth.signOut().then(() => {
      location.reload();
    });
  }


  ////////////////////
  // FRIEND CONTROL //


  acceptFriend(uid, name, email){
    // let newMyFriendList = this.changeMyFriendStatus(uid, 'friend', myFriendList);
    // this.changeHisFriendStatus(uid, 'friend');
    // return newMyFriendList;
    this.afs.collection('user_friend_list').doc(this.uid).update({
      friends: firebase.firestore.FieldValue.arrayRemove({
        uid:uid,
        displayName: name,
        email: email,
        status: 'received'
      })
    });    
    this.afs.collection('user_friend_list').doc(this.uid).update({
      friends: firebase.firestore.FieldValue.arrayUnion({
        uid:uid,
        displayName: name,
        email: email,
        status: 'friend'
      })
    });    

////////////
    this.afs.collection('user_friend_list').doc(uid).update({
      friends: firebase.firestore.FieldValue.arrayRemove({
        uid:this.uid,
        displayName: this.name,
        email: this.email,
        status: 'request'
      })
    });    
    this.afs.collection('user_friend_list').doc(uid).update({
      friends: firebase.firestore.FieldValue.arrayUnion({
        uid:this.uid,
        displayName: this.name,
        email: this.email,
        status: 'friend'
      })
    });        

  }

  denyFriend(uid, name, email){
    // let newMyFriendList = this.changeMyFriendStatus(uid, 'friend', myFriendList);
    // this.changeHisFriendStatus(uid, 'friend');
    // return newMyFriendList;
    this.afs.collection('user_friend_list').doc(this.uid).update({
      friends: firebase.firestore.FieldValue.arrayRemove({
        uid:uid,
        displayName: name,
        email: email,
        status: 'received'
      })
    });    

////////////
    this.afs.collection('user_friend_list').doc(uid).update({
      friends: firebase.firestore.FieldValue.arrayRemove({
        uid:this.uid,
        displayName: this.name,
        email: this.email,
        status: 'request'
      })
    });    
       
  }



  onBlockFriend(uid){
    // Unneccesary so far
  }

  
  findFriend(){
    return new Promise((resolve, reject) => {
      let email = (<HTMLInputElement>document.querySelector('.findfriend')).value;      
      let count = 0;

      // Check if the user already exist in my Friend List
      this.myFriendList.find((obj) => {
        if(obj.email == email){
          this.findFriendData = null;
          count++;
        }else{
          this.findFriendData = null;
        }
      });
      if(count > 0){
        console.log('해당유저는 이미 존재합니다');
        this.findFriendDataExist = true;
        document.querySelector('.friendfound').innerHTML = "<h6>The User already Exist</h6>";
      }else{
        this.findFriendDataExist = false;
        document.querySelector('.friendfound').innerHTML = "";

        // Find User Info w Email from Database and Display
        this.usersCol.snapshotChanges().pipe(map(changes =>{
          const change = changes.map(a => {
            const data = a.payload.doc.data() as User;
            data.uid = a.payload.doc.id;
            return data;
          });
          return change;
        }))
        .subscribe(data => {
          let result = null;
          let count = 0;
          data.find(function(obj){
            if(obj.email == email){
              result = obj;
              count++;
              console.log('found');
            }
            return false;
          });
          if(count > 0) { 
            this.findFriendData = result;
            console.log(result);
            resolve(result);
          }
        });    

      //});
      }
    });
  }
  // Send Friend Request
  sendFriendRequest(uid, name, email){
    this.afs.collection('user_friend_list').doc(this.uid).update({
      friends: firebase.firestore.FieldValue.arrayUnion({
        uid:uid,
        displayName: name,
        email: email,
        status: 'request'
      })
    });    

    this.afs.collection('user_friend_list').doc(uid).update({
      friends: firebase.firestore.FieldValue.arrayUnion({
        uid: this.uid,
        displayName: this.name,
        email: this.email,
        status: 'received'
      })
    });        
    
    console.log('Friend Request Done');

  } // Send Friend Request Done


  //
  // Very First Time Login, Add User data to USERS
  createUser(uid, displayName, email){
    this.afs.collection('users').doc(uid).set({
      'uid': uid,
      'displayName': displayName,
      'email':email
    });
    console.log('User Data Entered');
  }
  createUserFrinedList(uid, displayName, email) {
    // For the FirstTime user, create user friend list 
    this.afs.collection('user_friend_list').doc(uid).set({
      'uid': uid,
      'displayName': displayName,
      'friends':[]
    });    
  }
  createFriendPrayer(uid, displayName, email) {
    // For the FirstTime user, create user friend list 
    this.afs.collection('friend_prayer').doc(uid).set({
      'uid': this.uid,
      'displayName': displayName,
      'prayers':[]
    });    
  }  

  createUserGroup(uid, displayName, email){
    this.afs.collection('user_group').doc(uid).set({
      'uid': uid,
      'displayName': displayName,
      'group':[]
    });    
  }


  findGroup(){
    console.log(this.myGroupList);
    return new Promise((resolve, reject) => {
      let groupName:string = (<HTMLInputElement>document.querySelector('.findgroup')).value;
      let count = 0;

      // // Check if the user already exist in my Friend List
      // this.myGroupList.find((obj) => {
      //   if(obj.groupName.includes(groupName)){
      //     this.findGroupData = null;
      //     count++;
      //   }else{
      //     this.findGroupData = null;
      //   }
      // });
      // if(count > 0){
      //   console.log('the user is already your friend');
      //   this.findFriendDataExist = true;
      //   document.querySelector('.friendfound').innerHTML = "User already Exist";
      // }else{
      //   this.findFriendDataExist = false;
      //   document.querySelector('.friendfound').innerHTML = "";
      // }

      // Find User Info w Email from Database and Display



      this.myGroupList // Total Group List
      let found = [];
      this.myGroupList.map(obj=>{
        //console.log(groupName, str);
        
        let str:string = obj.groupName;
        str = str.toUpperCase();

        let groupId:string = obj.groupId;
        console.log('GROUP ID', groupId);
        groupId = groupId.toUpperCase();

        groupName = groupName.toUpperCase();

        if(obj.private){
          // DO nOThing, it's PRIVATE!
        }else{
          if(str.includes(groupName)){
            found.push(obj);          
          }else if(groupId == groupName){
            found.push(obj);
          }
        }


      });
      console.log(found);
      resolve(found);

      // this.usersCol.snapshotChanges().pipe(map(changes =>{
      //   const change = changes.map(a => {
      //     const data = a.payload.doc.data() as User;
      //     data.uid = a.payload.doc.id;
      //     return data;
      //   });
      //   return change;
      // }))
      // .subscribe(data => {
      //   let result = null;
      //   let count = 0;
      //   data.find(function(obj){
      //     if(obj.email == email){
      //       result = obj;
      //       count++;
      //       console.log('found');
      //     }
      //     return false;
      //   });
      //   if(count > 0) { 
      //     this.findFriendData = result;
      //     console.log(result);
      //     resolve(result);
      //   }
      // });    

    });
  }




  // PRYAER SHARING
  async sharePrayer(uid, share, displayName){
    // Refactored
    this.afs.collection('friend_prayer').doc(this.uid).update({
      prayers: firebase.firestore.FieldValue.arrayUnion({
        date:this.getTodayDate(),
        datecode:this.getDateCode(),
        uid:uid,
        displayName: displayName,
        prayer:share,
        status: 'shared'
      })
    });        
    console.log('Prayer Shared');

  }
  stopSharePrayer(uid){
    let myList = this.myFriendPrayer.find(obj=>{
      return obj.uid == this.uid;
    });
    let meme = myList.prayers.find(obj=>{
      return obj.uid == uid;
    });
    if(typeof(meme) != "undefined") {
      this.afs.collection('friend_prayer').doc(this.uid).update({
        prayers: firebase.firestore.FieldValue.arrayRemove({
          date: meme.date,
          datecode: meme.datecode,
          displayName: meme.displayName,
          prayer:meme.prayer,
          status:meme.status,
          uid:meme.uid
        })
      }); 
    }
    console.log('Unshared', uid);

  }

  // FRIEND CONTROL //

  /// I THINK THIS IS WRONG ONE...UNNECESSARY
  getMyFriendPrayerList(){
    // TRIGGERED AT CONSTRUCTOR & SUCCESS LOGIN
    return new Promise(resolve => {
      this.friendPrayersCol = this.afs
      .collection('friend_prayer', ref=>ref);
  
      // this has list of friend_prayer user
      this.friendPrayers = this.friendPrayersCol.snapshotChanges().pipe(map(changes =>{
        const change = changes.map(a => {
          const data = a.payload.doc.data() as FriendPrayer;
          data.uid = a.payload.doc.id;
          return data;
        });
        console.log('change ', change, this.uid);
        return change;
      }));
      let results;
  
      this.friendPrayers.subscribe(data=>{
        console.log('data ', data);
        data.find((obj) => {
          if(obj.uid == this.uid) { 
            results = obj; 
            console.log('marching ?', results);
          }
          return false;
        });

        this.myFriendPrayerList = results;

        resolve(results);  
      });
    });

  }

  getTotalFriendPrayerList(){
    // TRIGGERED AT CONSTRUCTOR & SUCCESS LOGIN
    return new Promise(resolve => {
      this.friendPrayersCol = this.afs
      .collection('friend_prayer', ref=>ref);
      let results;
      this.friendPrayers = this.friendPrayersCol.snapshotChanges().pipe(map(changes =>{
        const change = changes.map(a => {
          const data = a.payload.doc.data() as FriendPrayer;
          data.uid = a.payload.doc.id;
          return data;
        });
        return change;
      }));  
      this.friendPrayers.subscribe(data=>{
        results = data;
        resolve(results);  
      });
    });
  }


  getTodayDate(){
    const monthNames = ["JAN", "FEB", "MAR", "APR", "MAY", "JUN",
    "JUL", "AUG", "SEP", "OCT", "NOV", "DEC"];

    let d = new Date();
    let y = d.getFullYear();
    let m = monthNames[d.getMonth()];
    let day = d.getDate();    
    let result = m + " " + day + ", " + y;
    return result;
  }



  getDateCode(){
    let day = new Date();
    let m = day.getMonth();
    let d = day.getDate();
    let y = day.getFullYear();
    let dateCode = y+ "" + m + "" +d;
    return dateCode;
  }


///////////////////////
// Group Part
myGroupList; 
groupListsCol: AngularFirestoreCollection<Group>;
groupLists: Observable<Group[]>;
groupListsDoc: AngularFirestoreDocument<Group>;
groupList: Group = {
  groupName:"",
  groupUid:"",
  groupDesc:"", 
  groupMembers:[
      {
      displayName:"",
      uid:"",
      role:""
      }
  ],
  prayer:[
    {
      id:0,
      prayer:"",
      date:""
    }
  ],
  private:true,
  groupId:""
}

myGroupPrayerFinal;
myUserGroup;

myUserGroup_Owner;
myUserGroup_Member;
myUserGroup_Invited;
invitedNumber;
invitedExist:boolean = false;

userGroupsCol: AngularFirestoreCollection<UserGroup>;
userGroups: Observable<UserGroup[]>;
userGroupsDoc: AngularFirestoreDocument<UserGroup>;
userGroup: UserGroup = {
  displayName:"",
  uid:"",
  group:[
      {
      groupName:"",
      groupUid:"",
      role:"",
      private:true
      }
  ]
}

getMyUserGroup(){
  return new Promise((resolve, reject) => {
    this.userGroupsCol = this.afs
      .collection('user_group', ref=>ref);
    this.userGroups = this.userGroupsCol.snapshotChanges().pipe(map(changes =>{
      const change = changes.map(a => {
        const data = a.payload.doc.data() as UserGroup;
        data.uid = a.payload.doc.id;
        return data;
      });
      return change;
    }));  

    this.userGroups.subscribe(data=>{
      resolve(data);
    });
  });
}

getMyGroupList(){
  return new Promise((resolve, reject) =>{
    this.groupListsCol = this.afs
      .collection('group', ref=>ref);
    this.groupLists = this.groupListsCol.snapshotChanges().pipe(map(changes =>{
      const change = changes.map(a => {
        const data = a.payload.doc.data() as Group;
        data.groupUid = a.payload.doc.id;
        return data;
      });
      return change;
    }));  

    this.groupLists.subscribe(data=>{
      resolve(data);
    });

  });
}


getUid(){
  // let info = {uid: this.uid, displayName: this.name}
  // return info;
  return new Promise((resolve, reject) =>{
    resolve(this.uid);
  });
}



getUserInfo(){
  return new Promise((resolve, reject) =>{
    let info = {uid: this.uid, displayName: this.name}
    resolve(info);
  });
}



} // VERY END

