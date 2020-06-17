import { Component, OnInit, Input } from '@angular/core';
import { ModalController } from '@ionic/angular';
// import {AngularFirestore,
//   AngularFirestoreDocument,
//   AngularFirestoreCollection
// } from '@angular/fire/firestore';

import { UsersService} from '../users.service';

// import { Friend } from '../friend.model';
// import { Group } from '../group.model';
//import { map } from 'rxjs/operators';

@Component({
  selector: 'app-seemember',
  templateUrl: './seemember.component.html',
  styleUrls: ['./seemember.component.scss'],
})
export class SeememberComponent implements OnInit {
  @Input() groupUid:string;
  @Input() groupName: string;
  @Input() uid:string;

  // // My Group List
  // myGroupList:any; 
  // groupListsCol: AngularFirestoreCollection<Group>;
  // groupLists: Observable<Group[]>;
  // groupListsDoc: AngularFirestoreDocument<Group>;
  // groupList: Group = {
  //   groupName:"",
  //   groupUid:"",
  //   groupDesc:"", 
  //   groupMembers:[
  //       {
  //       displayName:"",
  //       uid:"",
  //       role:""
  //       }
  //   ],
  //   prayer:[
  //     {
  //       id:0,
  //       prayer:"",
  //       date:""
  //     }
  //   ],
  //   private:true
  // }    

  // //Friend Information
  // myFriendList:any;
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




  constructor(private modalCtrl: ModalController, private theUsers:UsersService) { }

  ngOnInit() {
    // //Get Total Group List
    // this.groupListsCol = this.afs
    //   .collection('group', ref=>ref);
    // this.groupLists = this.groupListsCol.snapshotChanges().pipe(map(changes =>{
    //   const change = changes.map(a => {
    //     const data = a.payload.doc.data() as Group;
    //     data.groupUid = a.payload.doc.id;
    //     return data;
    //   });
    //   return change;
    // }));  

    // this.groupLists.subscribe(data=>{
    //   this.myGroupList = data;
    //   console.log('group ', data);
    // });    

    // // Get Friend List
    // this.friendsCol = this.afs
    // .collection('user_friend_list', ref=>ref);

    // this.friends = this.friendsCol.snapshotChanges().pipe(map(changes =>{
    //   const change = changes.map(a => {
    //     const data = a.payload.doc.data() as Friend;
    //     data.uid = a.payload.doc.id;
    //     return data;
    //   });
    //   return change;
    // }));
    // this.friends.subscribe(data=>{
    //   this.myFriendList = data;
    //   console.log('Friend ', data);
    // })

  } //onInit End


  filterGroupMember(){
      let meme = this.theUsers.myGroupList.find(obj=>{
        return obj.groupUid == this.groupUid;
      });
      let hoho = [];
      meme.groupMember.find(obj=>{
        if(obj.role == 'member' || obj.role=='owner' || obj.role=='admin'){
          hoho.push(obj);
        }
      });

      // SORTING PROCESS
      hoho.sort(function(a, b){
        if(a.role < b.role) { return 1; }
        if(a.role > b.role) { return -1; }
        return 0;
      });

      return hoho;// meme.groupMember;    
    // if(this.myGroupList){
    //   let meme = this.myGroupList.find(obj=>{
    //     return obj.groupUid == this.groupUid;
    //   });

    //   // SORTING PROCESS
    //   meme.groupMember.sort(function(a, b){
    //     if(a.role < b.role) { return 1; }
    //     if(a.role > b.role) { return -1; }
    //     return 0;
    //   });

    //   return meme.groupMember;
    // }
  }


  // filterMyFriend(data){
  //     // Get My Friend
  //     let meme = this.theUsers.myFriendList.find(obj=>{
  //       return obj.uid == this.uid;
  //     });
  //     console.log(meme);

  //     //Get Group Friend 
  //     let momo = this.filterGroupMember();

  //     for( var i=meme.friends.length - 1; i>=0; i--){
  //       for( var j=0; j < momo.length; j++){
  //           if(meme.friends[i] && (meme.friends[i].uid === momo[j].uid)){
  //               meme.friends.splice(i, 1);
  //           }
  //       }
  //     }      

  //     return meme.friends;
  // }

  // !!!!!!!!!!!!!!! 나중에 꼭 해야 함 !!!!!!!!!!!11 ////////////
  onSendInvite(uid, name, email){
    this.theUsers.sendFriendRequest(uid, name, email);
    // 나중에 꼭 할 것. db 에서 현재 email 이 없어서 못함. 수정후 꼭 할 것.
    console.log('ask request', uid, name, email);
  }

  onAcceptFriend(uid, name, email){
    this.theUsers.acceptFriend(uid, name, email);
  }

  checkIfMyFriend(uid){
    let count = 0;
    let myFriend:any;
    this.theUsers.myFriendList.find(obj=>{
      if(obj.uid == uid){
        myFriend = obj;
        count++;
      }
    });
    if(count > 0){
      if(myFriend.status=='friend'){
        return 'friend';
      }else if(myFriend.status=='received'){
        return 'received';
      }else if(myFriend.status=='request'){
        return 'request';
      }
    }else{
      return 'no';
    }
  }


  async onClose(){
    await this.modalCtrl.dismiss({});
  }
  async onEnter(){
    await this.modalCtrl.dismiss({groupDesc:'', groupMember: ''});
  }



}
