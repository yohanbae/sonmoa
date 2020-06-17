import { Component, OnInit } from '@angular/core';
import { UsersService } from '../users.service';
import { ModalController } from '@ionic/angular';
import {UpdateComponent} from '../update/update.component';
import {AddComponent} from '../add/add.component';
import {ListService} from '../list.service';
import { ShareComponent } from '../share/share.component';
import { AngularFirestore, AngularFirestoreDocument,AngularFirestoreCollection } from '@angular/fire/firestore';
import { FirebaseUISignInSuccessWithAuthResult } from 'firebaseui-angular';

import { Router } from '@angular/router';

@Component({
  selector: 'app-tab1',
  templateUrl: 'tab1.page.html',
  styleUrls: ['tab1.page.scss']
})
export class Tab1Page implements OnInit {
  afAuth;

  prayerList = null;
  updateMode = false;
  currentUid = null;
  
  tabSelect:number = 1;

  // Timer Part //
  fullTime:any = null;
  percent:number = 0;
  timer:any = false;

  // Need to bring from Service
  progress; 
  minutes: number = 1;
  seconds: any = 30;
  elapsed:any ={
    h: '00',
    m:'00',
    s:'00'
  }
  overallTimer:any = false;
  today_prayer_success:any = false;


  // PERSONAL PRAYER VARIABLES
  objuid; // uid for Personal PRayer. IMPORTANT :: Share, Update, Del
  objshared; //displayName;





  constructor(private theUsers:UsersService, private modalCtrl: ModalController, private theList: ListService, private afs: AngularFirestore, private router:Router) {
    // private theGoal:GoalService, 
    // private insomnia: Insomnia,
    // public alertController: AlertController,
    // private ringtones: NativeRingtones
    //) {
  } // Constructor End

  ngOnInit() {
    console.log('INITATIANTION');
    // Friend, USer both needed
    this.afAuth = this.theUsers.afAuth;

    this.fullTime = this.theList.targetTimer;
    this.progress = this.theList.getCurrentPrayerTime();

    // Get Firebase Info from service
    this.theUsers.getSetup_Tab1();

  } // OnInit Done

  successCallback(signInSuccessData: FirebaseUISignInSuccessWithAuthResult){
    this.theUsers.getSetup_Tab1();

  }

  filterPersonalPrayerList(){
    return this.theList.thelist;
  }

  // PRAYER CRUD
  async showModal(){
    const modal = await this.modalCtrl.create({
      component: AddComponent
    });
    await modal.present();
    modal.onDidDismiss()
      .then( res => this.onAdd(res) );
  };

  onAdd(obj){
    if(!obj.data.newprayer){ }else{
      console.log('adding', obj);
      this.theList.add(obj);
    }
  }

  onDel(){
    this.closeSetup();
    this.theUsers.stopSharePrayer(this.objuid);    
    this.theList.delete(this.objuid);
  }


  async updateModal(){
    this.closeSetup();
    let prayer = this.theList.thelist.find((obj) => {
      if(obj.uid == this.objuid){
        return obj;
      }
    });

    const modal = await this.modalCtrl.create({
      component: UpdateComponent,
      componentProps: {
        uid: this.objuid,
        prayer: prayer.prayer
      }
    });
    await modal.present();
    modal.onDidDismiss()
      .then( res => this.onUpdate(this.objuid, res) );    
  }

  async onUpdate(uid, thenew){
    if(!thenew.data.newPrayer){
      //
    }else{
      this.theList.update(uid, thenew);
    }
  }

  async shareModal(){
    this.closeSetup();

    let prayer = this.theList.thelist.find((obj) => {
      if(obj.uid == this.objuid){
        return obj;
      }
    });

    const modal = await this.modalCtrl.create({
      component: ShareComponent,
      componentProps: {
        uid: this.objuid,
        prayer: prayer.prayer
      }
    });
    await modal.present();
    modal.onDidDismiss()
      .then( res => this.onShare(this.objuid, res, this.theUsers.name) );   
  }

  onShare(uid, theshare, displayName){
    if(!theshare.data.newPrayer){
      //
    }else{
      this.theList.share(uid); // Works
      this.theUsers.sharePrayer(uid, theshare.data.newPrayer, displayName);
      console.log('shared');
    }
  }

  onStopShare(uid){
    this.closeSetup();
    this.theList.stopShare(this.objuid);
    this.theUsers.stopSharePrayer(this.objuid);    
  }


  filterFriend() {  
    return this.theUsers.myFriendPrayerList;
  }

  //Get Group Prayer List
  filterGetGroupPrayer(){
    return this.theUsers.myGroupPrayerFinal;
  }

  onMoveLogin(){
    this.router.navigate(['/tabs/tab4']);
  }




// Timer Part

async presentAlert() {
  // const alert = await this.alertController.create({
  //   header: 'DONE',
  //   subHeader: 'Congratulation',
  //   message: `You reached today's prayer goal!`,
  //   buttons: ['Confirm']
  // });

  // await alert.present();
  alert('Congrat! You reached prayer goal!');
}

timerOn:boolean = false;
startTime(){
  if(!this.timerOn){
    if(this.theList.refresh){
      this.fullTime = this.theList.targetTimer;
      this.theList.refresh = false;
      this.progress = 0;
    }
  
    if(this.timer){
      clearInterval(this.timer);
    }
    
    if(!this.overallTimer){
      this.progressTimer();
      // this.insomnia.keepAwake();
    }
      
    let timeSplit = this.fullTime.split(':');
    this.minutes = timeSplit[1];
    this.seconds = timeSplit[2];
  
    let totalSeconds = Math.floor(this.minutes * 60) + parseInt(this.seconds);
  
    this.timer = setInterval(() => {
      if(this.percent >= 100){
        clearInterval(this.timer);
      }
  
      this.percent = Math.floor((this.progress / totalSeconds) * 100);
      this.progress++;
      }, 1000);
      this.timerOn = true;

      // Display Start Label for 3seconds
  }else{
    this.stopTime();
    this.timerOn = false;
      // Display Stop Label for 3seconds
  }

}

progressTimer(){
  let countDownDate = new Date();
  this.overallTimer = setInterval(() => {
    let refreshed = this.theList.refresh;
    if(refreshed){
      // need to reset the work
      clearInterval(this.overallTimer);
      this.resetTime();
      this.theList.refresh = false;
    }else{
      if(this.percent >= 100){
        clearInterval(this.overallTimer);
        this.done();
      }

      console.log(this.progress);

      this.elapsed.h = Math.floor(this.progress % (60 * 60 * 24) / 360);        
      this.elapsed.m = Math.floor(this.progress % (60 * 60) / 60);
      this.elapsed.s = Math.floor(this.progress % (60));
      
      this.elapsed.h = this.pad(this.elapsed.h, 2);
      this.elapsed.m = this.pad(this.elapsed.m, 2);
      this.elapsed.s = this.pad(this.elapsed.s, 2);
    }    
  }, 1000);
  
}

done(){
  this.theList.saveCurrentPrayerTime(this.progress);
  document.querySelector('.thetime').innerHTML = this.fullTime;
//  this.insomnia.allowSleepAgain();
  this.timer = false;
  this.today_prayer_success = true;
  this.theList.todayPrayerDone();

  this.presentAlert();

}  
  pad(num, size){
    let s = num+"";
    while(s.length <size) s= "0" + s;
    return s;
  }

stopTime(){
  this.theList.saveCurrentPrayerTime(this.progress);
  clearInterval(this.timer);
  clearInterval(this.overallTimer);
  this.overallTimer = false;
  this.timer = false;
//  this.insomnia.allowSleepAgain();
}

resetTime(){
  clearInterval(this.timer);
  clearInterval(this.overallTimer);
  this.overallTimer = false;
  this.timer = false;
//  this.insomnia.allowSleepAgain();

  this.fullTime = this.theList.targetTimer;
  this.progress = 0;

  console.log(this.fullTime );
}

ionViewWillEnter(){
  this.theUsers.getSetup_Tab1();

  //Get Timer number
  this.elapsed.h = Math.floor(this.progress % (60 * 60 * 24) / 360);        
  this.elapsed.m = Math.floor(this.progress % (60 * 60) / 60);
  this.elapsed.s = Math.floor(this.progress % (60));
  
  this.elapsed.h = this.pad(this.elapsed.h, 2);
  this.elapsed.m = this.pad(this.elapsed.m, 2);
  this.elapsed.s = this.pad(this.elapsed.s, 2);

  //Get Percentage
  let timeSplit = this.fullTime.split(':');
  this.minutes = timeSplit[1];
  this.seconds = timeSplit[2];

  let totalSeconds = Math.floor(this.minutes * 60) + parseInt(this.seconds);
  this.percent = Math.floor((this.progress / totalSeconds) * 100);    
}


  ////////////
  // UI Setup
  onTab(pick){
    this.tabSelect = pick;
  }
  closeSetup(){
    let thedoc = document.querySelector('.setup-wrap') as HTMLElement;//.style.display="none";
    setTimeout(function () {
      thedoc.style.display="none";    
    }, 500);
    thedoc.classList.remove('setup-wrap-on');

  }

  showSetup(uid, shared){
    let thedoc = document.querySelector('.setup-wrap') as HTMLElement;

    setTimeout(function () {
      thedoc.classList.add('setup-wrap-on');
    }, 20);
    thedoc.style.display="block";

    this.objuid = uid;
    this.objshared = shared;
    //this.displayName = this.theUsers.name;
    console.log('uid picked ', this.objuid, this.theUsers.name);
  }

  subNav:boolean = false;
  showSubNav(){
    let meme = document.querySelector('.thebackdark');
    let play = document.querySelector('.play-btn');
    let create = document.querySelector('.create-prayer-btn');
    let close = document.querySelector('.close-btn');

    if(this.subNav){
      meme.classList.remove('theon');
      play.classList.remove('play-on');
      create.classList.remove('create-on');
      close.classList.remove('close-on');
      this.subNav = false;
    }else{
      meme.classList.add('theon');
      play.classList.add('play-on');
      create.classList.add('create-on');
      close.classList.add('close-on');

      this.subNav = true;
    }

  }


}
