import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class ListService {

  thelist:any = null;
  prayer_data:any = null;
  today_date;

  targetTimer = '00:01:00';
  refresh = false;
  currentPrayerTime = 0;
  daily_record = [];

  constructor() {
    this.today_date = this.getTodayDate();

    this.prayer_data = JSON.parse(localStorage.getItem('prayer_data'));
    if (this.prayer_data) {
      this.thelist = this.prayer_data;
    } else {
      let datecode = this.getDateCode();
      this.thelist = [
        {uid:1, prayer:'Please add your prayer subject', date:this.today_date, sharing:false, datecode:datecode},
      ];
    }    

    if(localStorage.getItem('time_goal')){
      this.targetTimer = localStorage.getItem('time_goal');
    }
    if(localStorage.getItem('daily_record')){
      this.daily_record = JSON.parse(localStorage.getItem('daily_record'));
    } 
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


  add(obj){
    let newuid = 0;
    for(let i=0; i<this.thelist.length; i++){
      if(this.thelist[i].uid > newuid){
        newuid = this.thelist[i].uid;
      }
    }

    this.today_date = this.getTodayDate();
    let datecode = this.getDateCode();
    let newval = {uid: newuid+1, prayer: obj.data.newprayer, date:this.today_date, sharing:false, datecode:datecode};
    this.thelist.push(newval);

    this.saveLocal(this.thelist);
  }

  async update(uid, thenew){
    this.thelist.find(function(obj){
      if(obj.uid == uid){
        obj.prayer = thenew.data.newPrayer;
      }
      return false;
    });
    this.saveLocal(this.thelist);    
  }

  async share(uid){
    // Set the PRayer "sharing" as true
    console.log('share bigin');
    this.thelist.find((obj) => {
      if(obj.uid == uid){
        obj.status = 'shared';
      }
    });
    console.log('share answer', this.thelist);
    this.saveLocal(this.thelist);    
  }

  stopShare(uid){
    this.thelist.find((obj) => {
      if(obj.uid == uid){
        obj.status = 'no';
      }
    });
    console.log(this.thelist);
    this.saveLocal(this.thelist);   
  }

  async delete(uid){
    let filtered = this.thelist.filter(function(obj){
      return obj.uid !== uid;
    });
    this.thelist = filtered;
    this.saveLocal(this.thelist);
  }

  saveLocal(obj){
    localStorage.setItem('prayer_data', JSON.stringify(obj));    
  }


  // GOAL PART

  // PRAYER TIME PART
  getCurrentPrayerTime(){
    let dateCode = this.getDateCode();

    let count=0;
    let result = this.daily_record.find(function(obj){
      if(obj.date == dateCode){
        count++;
        return obj;
      }
    });

    if(count==0){
      result = 0;
    }else{
      result = result.prayer_current;
    }
    console.log(result);
    return result;
  }

  saveCurrentPrayerTime(thenow){
    // Today's Current Prayer Time if User Stopped Timer
    let dateCode = this.getDateCode();

    this.currentPrayerTime = thenow;

    let record = { date:dateCode, prayer_current: thenow, prayer_done:false, reading:0, reading_done: false};

    let count = 0;
    this.daily_record.find(function(obj){
      if(obj.date == dateCode){
        obj.prayer_current = thenow;
        count++;
      }
      return false;
    });
    if(count==0){
      this.daily_record.push(record);      
    }
    localStorage.setItem('daily_record', JSON.stringify(this.daily_record));

  }

  saveTimeGoal(time){
    this.targetTimer = time;
    localStorage.setItem('time_goal', time);
    console.log("time saved, ", time);
    this.refresh = true;    
  }

  todayPrayerDone(){ // PrayerDone
    // record daily
    let dateCode = this.getDateCode();
    
    let record = { date:dateCode, prayer_current:0, prayer_done:true, reading:0, reading_done: false};

    let count = 0;
    this.daily_record.find(function(obj){
      if(obj.date == dateCode){
        obj.prayer_done = true;
        count++;
      }
      return false;
    });
    if(count==0){
      this.daily_record.push(record);      
    }
    localStorage.setItem('daily_record', JSON.stringify(this.daily_record));

  }

  getDateCode(){
    let day = new Date();
    let m = day.getMonth();
    let d = day.getDate();
    let y = day.getFullYear();
    let dateCode = y+ "" + m + "" +d;
    return dateCode;
  }


}
