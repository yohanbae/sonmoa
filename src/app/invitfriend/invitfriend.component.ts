import { Component, OnInit, Input } from '@angular/core';
import { ModalController } from '@ionic/angular';
import {AngularFirestore,
  AngularFirestoreDocument,
  AngularFirestoreCollection
} from '@angular/fire/firestore';

import { UsersService } from '../users.service';
import * as firebase from 'firebase';

@Component({
  selector: 'app-invitfriend',
  templateUrl: './invitfriend.component.html',
  styleUrls: ['./invitfriend.component.scss'],
})
export class InvitfriendComponent implements OnInit {

  @Input() groupUid:string;
  @Input() groupName:string;
  @Input() uid:string;
  @Input() myRole:string;
  @Input() groupPrivate:boolean;

  filterMyFriendResult:any=[];
  constructor(private modalCtrl: ModalController, private afs: AngularFirestore, private theUsers:UsersService) { }

  ngOnInit() {
    console.log('Private?', this.groupPrivate);
    this.filterMyFriend();
  }

  filterGroupMember(){
    let meme = this.theUsers.myGroupList.find(obj=>{
      return obj.groupUid == this.groupUid;
    });

    // SORTING PROCESS
    meme.groupMember.sort(function(a, b){
      if(a.role < b.role) { return 1; }
      if(a.role > b.role) { return -1; }
      return 0;
    });
    return meme.groupMember;
  }

  filterMyFriend(){
    console.log('FILTER MY FRIEND');

      // Get My Friend
      let meme = this.theUsers.myFriendList;
    //   Get Group Friend 
      let momo = this.theUsers.myGroupList.find(obj=>{
        return obj.groupUid == this.groupUid;
      });


      console.log('MEME, MoMO, ', meme, momo);

      var onlyInA = meme.filter(this.comparer(momo.groupMember));
      var onlyInB = momo.groupMember.filter(this.comparer(meme));
      
      let haha = onlyInA.concat(onlyInB);
          
      console.log("MEME FRIENDS", haha);
      this.filterMyFriendResult = haha;

  }

  comparer(otherArray){
    return function(current){
      return otherArray.filter(function(other){
        return other.uid == current.uid
      }).length == 0;
    }
  }
  

  onSendInvite(uid, displayName, email){
    // Update user_group, to 'inivted'
      this.afs.collection('user_group').doc(uid).update({
        group: firebase.firestore.FieldValue.arrayUnion({
          groupName:this.groupName,
          groupUid:this.groupUid, 
          private:true, 
          role:'invited'
        })
      }) 
      .then(()=>{
        this.filterMyFriend();
      });  

      // 내 그룹에 invited 로 등록하기
      this.afs.collection('group').doc(this.groupUid).update({
        groupMember: firebase.firestore.FieldValue.arrayUnion({
          displayName:displayName, 
          role:'invited', 
          uid:uid,
          email:email
        })
      });

  }

  onOut(uid, name, email){
    this.afs.collection('user_group').doc(uid).update({
      group: firebase.firestore.FieldValue.arrayRemove({
        groupName:this.groupName,
        groupUid:this.groupUid, 
        private:true, 
        role:'invited'
      })
    })

    this.afs.collection('group').doc(this.groupUid).update({
      groupMember: firebase.firestore.FieldValue.arrayRemove({
        displayName:name, 
        role:'invited', 
        uid:uid,
        email:email
      })
    });    

    this.afs.collection('user_group').doc(uid).update({
      group: firebase.firestore.FieldValue.arrayRemove({
        groupName:this.groupName,
        groupUid:this.groupUid, 
        private:true, 
        role:'member'
      })
    });



    this.afs.collection('group').doc(this.groupUid).update({
      groupMember: firebase.firestore.FieldValue.arrayRemove({
        displayName:name, 
        role:'member', 
        uid:uid,
        email:email
      })
    })
    .then(()=>{
      this.filterMyFriend();
    });  
  }



  async onClose(){
    await this.modalCtrl.dismiss({});
  }
  async onEnter(){
    await this.modalCtrl.dismiss({groupDesc:'', groupMember: ''});
  }


}
