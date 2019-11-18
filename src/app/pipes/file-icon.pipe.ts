import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'fileIcon',
})
export class FileIconPipe implements PipeTransform {

  transform(value: any, ...args: any[]): any {
    const sfx = value && value.split('.')[1];
    switch (sfx) {
      case 'mp4':
        return 'video-camera';
      case 'jpg':
        return 'file-image';
      case 'mp3':
        return 'audio';
      case 'txt':
        return 'file-image';
    }
    return 'file-unknown';
  }

}
