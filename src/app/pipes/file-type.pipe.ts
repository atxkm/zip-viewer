import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'fileType',
})
export class FileTypePipe implements PipeTransform {

  transform(value: any, ...args: any[]): any {
    const sfx = value && value.split('.')[1];
    switch (sfx) {
      case 'mp4':
        return '视频';
      case 'jpg':
        return '图片';
      case 'txt':
        return '文本';
      case 'mp3':
        return '音频';
    }
    return '*';
  }

}
