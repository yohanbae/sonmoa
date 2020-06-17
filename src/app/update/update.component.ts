import { Component, OnInit, Input } from '@angular/core';
import { ModalController } from '@ionic/angular';


@Component({
  selector: 'app-update',
  templateUrl: './update.component.html',
  styleUrls: ['./update.component.scss'],
})
export class UpdateComponent implements OnInit {
  @Input() prayer:string;
  @Input() uid:number;
  
  constructor(private modalCtrl:ModalController) { }

  ngOnInit() {}
  async close(){
    await this.modalCtrl.dismiss({});
  }

  async onUpdate(){
    let newOne = this.prayer;
    if(newOne ==""){
      //      
    }else{
      await this.modalCtrl.dismiss({newPrayer: newOne});
    }
  }
}
