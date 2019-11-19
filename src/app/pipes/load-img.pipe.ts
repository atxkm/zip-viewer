import { Pipe, PipeTransform } from '@angular/core';
import { ElectronService } from 'ngx-electron';

@Pipe({
  name: 'loadImg',
})
export class LoadImgPipe implements PipeTransform {

  constructor(
    private electron: ElectronService,
  ) {
  }

  transform(value: any, ...args: any[]): any {
    const data = this.electron.ipcRenderer.sendSync('message', { type: 'getImg', data: { path: value } });
    return 'data:image/jpeg;base64,' + data;
  }

}
