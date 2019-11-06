import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FileIconPipe } from './file-icon.pipe';
import { FileTypePipe } from './file-type.pipe';
import { SizePipe } from './size.pipe';
import { TimePipe } from './time.pipe';

@NgModule({
  declarations: [
    FileIconPipe,
    FileTypePipe,
    SizePipe,
    TimePipe,
  ],
  exports: [
    FileIconPipe,
    FileTypePipe,
    SizePipe,
    TimePipe,
  ],
  imports: [
    CommonModule,
  ],
})
export class PipesModule {
}
