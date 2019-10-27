import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { NzButtonModule, NzIconModule, NzModalModule, NzProgressModule, NzTypographyModule } from 'ng-zorro-antd';
import { NgxElectronModule } from 'ngx-electron';

import { HomeComponent } from './home/home.component';

@NgModule({
  declarations: [
    HomeComponent,
  ],
  imports: [
    CommonModule,
    NzTypographyModule,
    NzIconModule,
    NzButtonModule,
    NzProgressModule,
    FormsModule,
    NzModalModule,
    NgxElectronModule,
  ],
})
export class PagesModule {
}
