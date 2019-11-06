import { Pipe, PipeTransform } from '@angular/core';
import * as moment from 'moment';

@Pipe({
  name: 'time',
})
export class TimePipe implements PipeTransform {

  transform(value: any, ...args: any[]): any {
    return moment(value).format('YYYY-MM-DD HH:mm:ss');
  }

}
