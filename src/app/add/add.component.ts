import { Component, OnInit } from '@angular/core';
import { ModalController } from '@ionic/angular';

@Component({
  selector: 'app-add',
  templateUrl: './add.component.html',
  styleUrls: ['./add.component.scss'],
})
export class AddComponent implements OnInit {
  newPrayer:string="";

  constructor(private modalCtrl: ModalController) { }

  ngOnInit() {}
  async close(){
    await this.modalCtrl.dismiss({});
  }
  async onEnter(){
    await this.modalCtrl.dismiss({newprayer: this.newPrayer});
  }
}
