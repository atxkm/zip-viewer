import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { NzButtonModule, NzIconModule, NzInputModule, NzLayoutModule, NzModalModule, NzProgressModule, NzTreeModule, NzTypographyModule } from 'ng-zorro-antd';
import { NgxElectronModule } from 'ngx-electron';

import { HomeComponent } from './home/home.component';
import { FileComponent } from './file/file.component';

@NgModule({
  declarations: [
    HomeComponent,
    FileComponent,
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
    NzLayoutModule,
    NzTreeModule,
    NzInputModule,
  ],
})
export class PagesModule {
}
