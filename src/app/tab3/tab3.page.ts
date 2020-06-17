import { Component, OnInit } from '@angular/core';
import { UsersService} from '../users.service';

import { v4 as uuid } from 'uuid';


import {AngularFirestore,
  AngularFirestoreDocument,
  AngularFirestoreCollection
} from '@angular/fire/firestore';
import { AngularFireAuth } from '@angular/fire/auth';

import { ModalController } from '@ionic/angular';
import { CreategroupComponent } from '../creategroup/creategroup.component';
import { PostgroupprayerComponent} from '../postgroupprayer/postgroupprayer.component';
import {InvitfriendComponent} from '../invitfriend/invitfriend.component'
import { ManageadminComponent } from '../manageadmin/manageadmin.component';
import { SeememberComponent } from '../seemember/seemember.component';

import { map } from 'rxjs/operators';
import * as firebase from 'firebase';
import { Router } from '@angular/router';

import { AlertController } from '@ionic/angular';


@Component({
  selector: 'app-tab3',
  templateUrl: 'tab3.page.html',
  styleUrls: ['tab3.page.scss']
})
export class Tab3Page implements OnInit{
  uid;
  displayName;
  groupName;

  invitedNumber:number = 0;


  constructor(
    private data:UsersService,
    private modalCtrl: ModalController,
    private afs: AngularFirestore,
    private theUsers: UsersService,
    public afAuth: AngularFireAuth,
    private router: Router,
    public alertController: AlertController    
    ) {
  } //constructor end

  ngOnInit(){
    this.theUsers.getSetup_Tab3();
  }
  ionViewWillEnter(){
    this.theUsers.getSetup_Tab3();

  }

  async showModal(){
    const modal = await this.modalCtrl.create({
      component: CreategroupComponent,
      componentProps: {
        lists: this.theUsers.myFriendList
      }
    });
    await modal.present();
    modal.onDidDismiss()
      .then( res => this.onCreateGroup(res) );
  };

  onCreateGroup(res){
    //console.log('BACK ON ONCREATEGROUP');
    console.log(res);
    if(Object.entries(res.data).length === 0){
      //
    }else{
      console.log(res);
      let groupName = res.data.groupName;
      let groupDesc = res.data.groupDesc;
      let groupMember = res.data.groupMember;
      let privateMode = res.data.private;
      let groupId = res.data.groupId;

      groupMember.push({displayName: this.theUsers.name, uid:this.theUsers.uid, email:this.theUsers.email, role:"owner"});
      let uid = uuid();
  
      console.log('GM', groupId);
      //Post new group to GROUP
      this.afs.collection('group').doc(uid).set({
        'groupName': groupName,
        'groupDesc': groupDesc,
        'private': privateMode,
        'groupMember': groupMember,
        'groupUid': uid,
        'prayer':[],
        'groupId': groupId
      });
  
      // Post New Group to UserGroup
      this.assignGroupMember(groupMember, groupName, uid);
      console.log('data entered');
    }

   }
   
   // Refactored
   assignGroupMember(groupMember, groupName, groupUid){
    // Post members to UserGroup
    groupMember.map(obj=>{
      let postingGroupInfo;
      if(this.theUsers.uid == obj.uid){
        postingGroupInfo = {groupName: groupName, groupUid: groupUid, private:true, role:'owner'};
      }else{
        postingGroupInfo = {groupName: groupName, groupUid: groupUid, private:true, role:'invited'};        
      }

      this.afs.collection('user_group').doc(obj.uid).update({
        group: firebase.firestore.FieldValue.arrayUnion(postingGroupInfo)
      });

      console.log('saved');
    });
  }


  getMyFriendList(){
    return this.theUsers.myFriendList;
  }

  filterMyOwnGroup(data){ // Role: 'Owner'
    return this.theUsers.myUserGroup_Owner;
  }

  filterMyGroup(){ // Role: 'member'
    return this.theUsers.myUserGroup_Member;
  }

  isObjectEmpty(card){
    return Object.keys(card).length === 0;
 }

  getInvitedGroupNumber(){
    return this.theUsers.invitedNumber;
  }

  filterMyInvitedGroup(){ // Role: 'invited'
    return this.theUsers.myUserGroup_Invited;
  }


  // change this name to "filterGetGroupPrayer"
  groupUid:string;
  areyouOwner:boolean = false;
  areyouAdmin:boolean = false;  
  areyouPrivate:boolean = false;
  myRole="";
  groupPrivate:boolean;

  onGroupClick(groupUid, groupName, role, groupPrivate){

    this.areyouOwner = false;
    this.areyouAdmin = false;
    this.areyouPrivate = false;
    this.myRole = role;

    this.groupUid = groupUid;
    this.groupName = groupName;
    this.groupPrivate = groupPrivate;

    console.log('REALLY?;', groupPrivate);

    // Moved from checkOwner   
    if(role=='owner'){
      this.areyouOwner = true;
    }else if(role=='admin'){
      this.areyouAdmin = true;
    }else if(role=='member'){
      this.areyouPrivate = true;
    }
    this.showBox();
  }



  filterGetGroupPrayer(){
    if(this.groupUid){   
      let result = this.theUsers.myGroupList.find(obj=>{
        return obj.groupUid == this.groupUid
      });
      return result.prayer;
    }
  }


  findGroupData:any = null;
  onFindGroup(){
//    console.log('Total Groups ', this.theUsers.myGroupList);
    this.theUsers.findGroup()
    .then(obj=>{
      this.findGroupData = obj;
    });
  }  

  onSubscribe(groupUid, groupName){
    //console.log(groupUid, this.theUsers.name, this.theUsers.uid, this.theUsers.email);

    this.afs.collection('group').doc(groupUid).update({
      groupMember: firebase.firestore.FieldValue.arrayUnion({
        displayName:this.theUsers.name,
        email:this.theUsers.email,
        uid:this.theUsers.uid,
        role:'member'
      })
    });

    this.afs.collection('user_group').doc(this.theUsers.uid).update({
      group: firebase.firestore.FieldValue.arrayUnion({
        groupName:groupName,
        groupUid:groupUid,
        private:false,
        role:'member'
      })
    });    
    console.log('subscribed');
  }

  onOut(){
    this.afs.collection('group').doc(this.groupUid).update({
      groupMember: firebase.firestore.FieldValue.arrayRemove({
        displayName:this.theUsers.name,
        email:this.theUsers.email,
        uid:this.theUsers.uid,
        role:'member'
      })
    });

    this.afs.collection('user_group').doc(this.theUsers.uid).update({
      group: firebase.firestore.FieldValue.arrayRemove({
        groupName:this.groupName,
        groupUid:this.groupUid,
        private:this.groupPrivate,
        role:'member'
      })
    });    
    console.log('You left this group');
    this.closeBox();
  }

  async onDenyInvitation(groupName, groupUid, groupPrivate){

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
            this.afs.collection('group').doc(groupUid).update({
              groupMember: firebase.firestore.FieldValue.arrayRemove({
                displayName:this.theUsers.name,
                email:this.theUsers.email,
                uid:this.theUsers.uid,
                role:'invited'
              })
            });
        
            this.afs.collection('user_group').doc(this.theUsers.uid).update({
              group: firebase.firestore.FieldValue.arrayRemove({
                groupName:groupName,
                groupUid:groupUid,
                private:groupPrivate,
                role:'invited'
              })
            });    
            console.log('You left this group');  
          }
        }
      ]
    });

    await alert.present();    
  }

  checkAlreadyMember(groupUid){
    let meme = null;
    meme = this.theUsers.myGroupList.find(obj=>{
      return obj.groupUid == groupUid;
    });
    console.log('my ', meme);
    let count = 0;
    if(meme){
      meme.groupMember.find(obj=>{
        if(obj.uid == this.theUsers.uid){
          if(obj.role == 'member' || obj.role=='invited' || obj.role=='owner' || obj.role=='admin'){
            count++;
            return true;
          }
        }
      });
    }

    if(count > 0){
      return true;
    }else{
      return false;
    }
  }


  onAcceptInvitation(groupName, groupUid, pri){
      this.afs.collection('group').doc(groupUid).update({
        groupMember: firebase.firestore.FieldValue.arrayRemove({
          displayName:this.theUsers.name,
          email:this.theUsers.email,
          uid:this.theUsers.uid,
          role:'invited'
        })
      });
      this.afs.collection('group').doc(groupUid).update({
        groupMember: firebase.firestore.FieldValue.arrayUnion({
          displayName:this.theUsers.name,
          email:this.theUsers.email,
          uid:this.theUsers.uid,
          role:'member'
        })
      });

      this.afs.collection('user_group').doc(this.theUsers.uid).update({
        group: firebase.firestore.FieldValue.arrayRemove({
          groupName:groupName,
          groupUid:groupUid,
          private:pri,
          role:'invited'
        })
      });
      this.afs.collection('user_group').doc(this.theUsers.uid).update({
        group: firebase.firestore.FieldValue.arrayUnion({
          groupName:groupName,
          groupUid:groupUid,
          private:pri,
          role:'member'
        })
      });

  }



  ///////
  //Group Management

  // MANAGE GROUP PRAYER : CRUD
  onAddPrayer(){
    // use this.groupUid // its already assigned
    // this will appeared if you are OWNER
    this.showAddPrayer();
  }

  async showAddPrayer(){
    const modal = await this.modalCtrl.create({
      component: PostgroupprayerComponent,
      componentProps: {
        groupUid: this.groupUid
      }
    });
    await modal.present();
    modal.onDidDismiss()
      .then( res => this.onManageGroupPrayer(res) );
  };
  onManageGroupPrayer(res){
    console.log(res);
  }

  // MANAGE FRIENDS :: INVITE / REMOVE
  onInviteFriend(){
    // use this.groupUid // its already assigned
    // this will appeared if you are OWNER
    this.showManageFriend();
  }
  async showManageFriend(){
    const modal = await this.modalCtrl.create({
      component: InvitfriendComponent,
      componentProps: {
        groupUid:this.groupUid,
        uid: this.theUsers.uid,
        groupName: this.groupName,
        myRole: this.myRole,
        groupPrivate: this.groupPrivate
      }
    });
    await modal.present();
    modal.onDidDismiss()
      .then( res => this.onManageFriend(res) );
  };
  onManageFriend(res){
    console.log(res);
  }


  // MANAGE ADMIN :: ASSIGN / FIRE
  onAssignAdmin(){
    this.showAssignAdmin();
  }
  async showAssignAdmin(){
    const modal = await this.modalCtrl.create({
      component: ManageadminComponent,
      componentProps: {
        groupUid: this.groupUid,
        groupName: this.groupName
      }
    });
    await modal.present();
    modal.onDidDismiss()
      .then( res => this.onManageAdmin(res) );
  };
  onManageAdmin(res){
    console.log(res);
  }

  onSeeMember(){
    this.showSeeMember();
  }
  async showSeeMember(){
    const modal = await this.modalCtrl.create({
      component: SeememberComponent,
      componentProps: {
        groupUid: this.groupUid,
        groupName: this.groupName,
        uid: this.theUsers.uid,
      }
    });
    await modal.present();
    modal.onDidDismiss()
      .then( res => this.onManageAdmin(res) );
  };


  onMoveLogin(){
    this.router.navigate(['/tabs/tab4']);
  }


  // UI 

  closeBox(){
    let thedoc = document.querySelector('.thebox-wrap') as HTMLElement;//.style.display="none";
    setTimeout(function () {
      thedoc.style.display="none";    
    }, 500);
    thedoc.classList.remove('thebox-wrap-on');
  }
  
  showBox(){
    let thedoc = document.querySelector('.thebox-wrap') as HTMLElement;
    setTimeout(function () {
      thedoc.classList.add('thebox-wrap-on');
    }, 20);
    thedoc.style.display="block";
  }

}
