import { Component, OnInit, Input } from '@angular/core';
import { ModalController } from '@ionic/angular';
import { UsersService } from '../users.service';

@Component({
  selector: 'app-creategroup',
  templateUrl: './creategroup.component.html',
  styleUrls: ['./creategroup.component.scss'],
})
export class CreategroupComponent implements OnInit {
  @Input() lists:string;

  groupName:string=""; // use [(ngModel)]="newPrayer" to use this\
  groupDesc:string="";
  groupId:string="";
  idCorrect:string="";
  thePrivate:boolean = true;
  members:any =[];
  nameMsg:string="";
  descMsg:string="";

  constructor(private modalCtrl: ModalController, private theUsers:UsersService) { 

//    console.log(this.lists);
  }

  ngOnInit() {}

  async onClose(){
    await this.modalCtrl.dismiss({});
  }
  async onEnter(){
    // Check if ID is exist
    if(this.checkIdExist()){
      this.idCorrect = "The Group ID already exist";
    }else if(this.groupId == ""){
      this.idCorrect = "Please enter ID";
    }else if(this.groupName == ""){
      this.nameMsg = "Please type group name";
    }else if(this.groupDesc == ""){
      this.nameMsg = "Please type group Description";
    }else{
      await this.modalCtrl.dismiss({groupName: this.groupName, groupDesc:this.groupDesc, groupMember: this.members, private:this.thePrivate, groupId:this.groupId});
    }

  }

  checkIdExist(){
    let count=0;
    this.theUsers.myGroupList.find(obj=>{
      if(obj.groupId == this.groupId){
        count++;
      }
    });
    if(count>0){
      return true;
    }else{
      return false;
    }
  }

  onInvite(displayName, uid, email){
    let count = 0;
    this.members.find(obj=>{
      if(obj.uid == uid){
        count++;
      }
    });

    if(count > 0){
      let filtered = this.members.filter(obj=>{
        return obj.uid !== uid;
      });
      this.members = filtered;
      console.log('member removed');
    }else{
      let newValue = {displayName:displayName, uid:uid, email:email, role:'invited'}
      this.members.push(newValue);
      console.log('member added ', this.members);
    }
  }


}
