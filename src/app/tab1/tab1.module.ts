import { IonicModule } from '@ionic/angular';
import { RouterModule } from '@angular/router';
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Tab1Page } from './tab1.page';
import { FirebaseUIModule } from 'firebaseui-angular';

import { UpdateComponent } from '../update/update.component';
import { AddComponent } from '../add/add.component';
import {ShareComponent} from '../share/share.component';

@NgModule({
  imports: [
    IonicModule,
    CommonModule,
    FormsModule,
    RouterModule.forChild([{ path: '', component: Tab1Page }]),
    FirebaseUIModule,
  ],
  declarations: [Tab1Page, UpdateComponent, AddComponent,ShareComponent],
  entryComponents: [UpdateComponent, AddComponent, ShareComponent]
})
export class Tab1PageModule {}
