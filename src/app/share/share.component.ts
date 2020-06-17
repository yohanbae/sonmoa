import { Component, OnInit, Input } from '@angular/core';
import { ModalController } from '@ionic/angular';

@Component({
  selector: 'app-share',
  templateUrl: './share.component.html',
  styleUrls: ['./share.component.scss'],
})
export class ShareComponent implements OnInit {
  @Input() prayer:string;
  @Input() uid:number;
  
  constructor(private modalCtrl:ModalController) { }

  ngOnInit() {}
  async close(){
    await this.modalCtrl.dismiss({});
  }

  async onShare(){
    let newOne = this.prayer;
    if(newOne ==""){
      //      
    }else{
      await this.modalCtrl.dismiss({newPrayer: newOne});
    }
  }
}
