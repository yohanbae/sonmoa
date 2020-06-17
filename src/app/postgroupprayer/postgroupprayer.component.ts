import { Component, OnInit, Input } from '@angular/core';
import { ModalController } from '@ionic/angular';

import {AngularFirestore,
  AngularFirestoreDocument,
  AngularFirestoreCollection
} from '@angular/fire/firestore';

// import { Group } from '../group.model';
import { map } from 'rxjs/operators';
import { Observable } from 'rxjs';
import { UsersService } from '../users.service';
import * as firebase from 'firebase';


@Component({
  selector: 'app-postgroupprayer',
  templateUrl: './postgroupprayer.component.html',
  styleUrls: ['./postgroupprayer.component.scss'],
})
export class PostgroupprayerComponent implements OnInit {

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


  @Input() groupUid:string;
  id_picked:number;
  updating:boolean=false;

  constructor(private modalCtrl: ModalController, private afs: AngularFirestore, private theUsers:UsersService) { 

 //   console.log(this.myGroupList);    

  }

  ngOnInit() {

      // this.groupListsCol = this.afs
      // .collection('group', ref=>ref);
      // let meme = this.groupListsCol.snapshotChanges().pipe(map(changes =>{
      //   const change = changes.map(a => {
      //     const data = a.payload.doc.data() as Group;
      //     data.groupUid = a.payload.doc.id;
      //     return data;
      //   });
      //   return change;
      // }));

      // meme.subscribe(data=>{
      //   this.myGroupList = data;
      //   console.log(data);
      // });      

  }

  filterGetGroupPrayer(data){
    if(this.theUsers.myGroupList && this.groupUid){   
      let result = this.theUsers.myGroupList.find(obj=>{
        return obj.groupUid == this.groupUid
      });
      return result.prayer;
    }
  }

  onPost(){
    // display post window
    let thedoc = document.querySelector('.post-box') as HTMLElement;//;
    thedoc.style.display="block";
  }
  onPostSubmit(){
    console.log(this.groupUid);
    let thedoc = (<HTMLInputElement>document.querySelector('.prayer-post')).value

    console.log(thedoc);

    // Process to Generate NEW ID
    let meme = this.theUsers.myGroupList.find(obj=>{
      return obj.groupUid == this.groupUid;
    });
    let old = meme.prayer;

    if(this.updating){
      // Update Code
      let theold = old.find(obj=>{
        return obj.id == this.id_picked;
      });
      this.afs.collection('group').doc(this.groupUid).update({
        prayer: firebase.firestore.FieldValue.arrayRemove({
          date:theold.date,
          id:this.id_picked,
          prayer: theold.prayer
        })
      });  
      this.afs.collection('group').doc(this.groupUid).update({
        prayer: firebase.firestore.FieldValue.arrayUnion({
          date:theold.date,
          id:this.id_picked,
          prayer: thedoc
        })
      });  
      this.updating = false;
    } else{
      // Generate new Id
      let newId = old[old.length - 1].id + 1;
      this.afs.collection('group').doc(this.groupUid).update({
        prayer: firebase.firestore.FieldValue.arrayUnion({
          date:this.getTodayDate(),
          id:newId,
          prayer: thedoc
        })
      });          
    }
    //   // Generate new Row
    //   old.push({date:this.getTodayDate(), id:newId, prayer: thedoc});
    // }



    // this.afs.collection('group').doc(this.groupUid).update({
    //   prayer: old
    // });

    console.log('Group Prayer Submitted');
    this.onPostClose();
  }
  onPostClose(){
    let theinput = <HTMLInputElement>document.querySelector('.prayer-post');
    theinput.value="";
    let thedoc = document.querySelector('.post-box') as HTMLElement;//;    
    thedoc.style.display="none";

    this.updating=false;
  }

  onDelete(id){
    let meme:any = this.theUsers.myGroupList.find(obj=>{
      return obj.groupUid == this.groupUid;
    });
    let result = meme.prayer.find(obj=>{
      return obj.id == id;
    });

    // this.afs.collection('group').doc(this.groupUid).update({
    //   prayer: result
    // });

    this.afs.collection('group').doc(this.groupUid).update({
      prayer: firebase.firestore.FieldValue.arrayRemove({
        date:result.date,
        id:id,
        prayer: result.prayer
      })
    });  


  }

  onUpdate(id, prayer){
    this.updating = true;
    this.id_picked = id;
    (<HTMLInputElement>document.querySelector('.prayer-post')).value = prayer;

    this.onPost();
  }



  onDisplayOption(){
    // Update / Delete
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



  async onClose(){
    await this.modalCtrl.dismiss({});
  }
  async onEnter(){
    await this.modalCtrl.dismiss({groupDesc:'', groupMember: ''});
  }

}
