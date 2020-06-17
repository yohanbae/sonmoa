import { Component, OnInit, Input } from '@angular/core';
import { ModalController } from '@ionic/angular';
import {AngularFirestore,
  AngularFirestoreDocument,
  AngularFirestoreCollection
} from '@angular/fire/firestore';

import { UsersService } from '../users.service';
import * as firebase from 'firebase';

@Component({
  selector: 'app-manageadmin',
  templateUrl: './manageadmin.component.html',
  styleUrls: ['./manageadmin.component.scss'],
})
export class ManageadminComponent implements OnInit {

  @Input() groupUid:string;
  @Input() groupName: string;


  constructor(private modalCtrl: ModalController, private afs: AngularFirestore, private theUsers:UsersService) { }

  ngOnInit() {
  }


  filterGroupMember(){
    let meme = this.theUsers.myGroupList.find(obj=>{
        return obj.groupUid == this.groupUid;
      });
      return meme.groupMember;
  }

  onAssign(uid, name, email){
    this.afs.collection('group').doc(this.groupUid).update({
      groupMember: firebase.firestore.FieldValue.arrayRemove({
        uid:uid,
        displayName: name,
        email: email,
        role: 'member'
      })
    });
    this.afs.collection('group').doc(this.groupUid).update({
      groupMember: firebase.firestore.FieldValue.arrayUnion({
        uid:uid,
        displayName: name,
        email: email,
        role: 'admin'
      })
    });    

    this.afs.collection('user_group').doc(uid).update({
      group: firebase.firestore.FieldValue.arrayUnion({
        groupName:this.groupName,
        groupUid:this.groupUid,
        private:true,
        role: 'member'
      })
    });
    this.afs.collection('user_group').doc(uid).update({
      group: firebase.firestore.FieldValue.arrayUnion({
        groupName:this.groupName,
        groupUid:this.groupUid,
        private:true,
        role: 'admin'
      })
    });    
  }
  onDismiss(uid, name, email){
    this.afs.collection('group').doc(this.groupUid).update({
      groupMember: firebase.firestore.FieldValue.arrayRemove({
        uid:uid,
        displayName: name,
        email: email,
        role: 'admin'
      })
    });
    this.afs.collection('group').doc(this.groupUid).update({
      groupMember: firebase.firestore.FieldValue.arrayUnion({
        uid:uid,
        displayName: name,
        email: email,
        role: 'member'
      })
    });    

    this.afs.collection('user_group').doc(uid).update({
      group: firebase.firestore.FieldValue.arrayUnion({
        groupName:this.groupName,
        groupUid:this.groupUid,
        private:true,
        role: 'admin'
      })
    });
    this.afs.collection('user_group').doc(uid).update({
      group: firebase.firestore.FieldValue.arrayUnion({
        groupName:this.groupName,
        groupUid:this.groupUid,
        private:true,
        role: 'member'
      })
    });        
  }


  async onClose(){
    await this.modalCtrl.dismiss({});
  }
  async onEnter(){
    await this.modalCtrl.dismiss({groupDesc:'', groupMember: ''});
  }

}
