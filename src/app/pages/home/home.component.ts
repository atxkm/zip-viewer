import { Component, NgZone, OnDestroy, OnInit } from '@angular/core';
import { NzModalService } from 'ng-zorro-antd';
import { ElectronService } from 'ngx-electron';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss'],
})
export class HomeComponent implements OnInit, OnDestroy {

  stokeColor = { '0%': '#108ee9', '50%': '#2db7f5', '100%': '#87d068' };
  dragover = false;
  file: File;
  password = '123';
  percent = 0;
  analysising = false;

  constructor(
      private modalService: NzModalService,
      private electron: ElectronService,
      private ngZone: NgZone,
  ) {
  }

  ngOnInit() {
    document.ondragover = e => {
      e.preventDefault();
    };
    document.ondrop = e => {
      e.preventDefault();
    };
    const boxDom = document.getElementById('box');
    boxDom.ondragover = e => {
      e.preventDefault();
    };
    boxDom.ondrop = e => {
      const file = e.dataTransfer.files[0];
      this.fileChange(file);
    };

    // electron监听
    this.onElectronMessage();
  }

  ngOnDestroy(): void {
    document.ondragover = null;
  }

  sendElectronMessage(type, data) {
    this.electron.ipcRenderer.send('message', { type, data });
  }

  onChange(e) {
    const file = e.target.files[0];
    this.fileChange(file);
  }

  fileChange(file) {
    if (!file) {
      return;
    }
    this.ngZone.run(() => {
      this.file = file;
      this.sendElectronMessage('changeFolder', file.path);
    });
  }

  analysis() {
    if (!this.password) {
      this.modalService.warning({ nzTitle: '密码未填！' });
      return;
    }
    this.analysising = true;
    this.sendElectronMessage('analyseFolder', { path: this.file.path, password: this.password });
  }

  cancel() {
    this.modalService.confirm({
      nzTitle: '确认取消吗?',
      nzOnOk: () => {
        this.analysising = false;
      },
    });
  }

  onElectronMessage() {
    this.electron.ipcRenderer.on('message', (e, message) => {
      this.ngZone.run(() => {
        const type = message.type;
        switch (type) {
          case 'log':
            console.log(...message.data);
            break;
          case 'isNotFolder':
            this.file = null;
            this.modalService.error({ nzTitle: '请选择文件夹' });
            break;
        }
      });
    });
  }

}
