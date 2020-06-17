import { IonicModule } from '@ionic/angular';
import { RouterModule } from '@angular/router';
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Tab3Page } from './tab3.page';

import { CreategroupComponent } from '../creategroup/creategroup.component';
import { PostgroupprayerComponent} from '../postgroupprayer/postgroupprayer.component';
import {InvitfriendComponent} from '../invitfriend/invitfriend.component'
import { ManageadminComponent } from '../manageadmin/manageadmin.component';
import { SeememberComponent } from '../seemember/seemember.component';

@NgModule({
  imports: [
    IonicModule,
    CommonModule,
    FormsModule,
    RouterModule.forChild([{ path: '', component: Tab3Page }])
  ],
  declarations: [Tab3Page, CreategroupComponent,PostgroupprayerComponent,InvitfriendComponent,ManageadminComponent,SeememberComponent],
  entryComponents: [CreategroupComponent,PostgroupprayerComponent,InvitfriendComponent,ManageadminComponent,SeememberComponent]
})
export class Tab3PageModule {}
