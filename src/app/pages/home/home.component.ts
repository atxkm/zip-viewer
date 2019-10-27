import { Component, OnDestroy, OnInit } from '@angular/core';
import { NzModalService } from 'ng-zorro-antd';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss'],
})
export class HomeComponent implements OnInit, OnDestroy {

  stokeColor = { '0%': '#108ee9', '50%': '#2db7f5', '100%': '#87d068' };
  dragover = false;
  file: File;
  percent = 0;
  analysising = false;

  constructor(
      private modalService: NzModalService,
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
      if (file) {
        this.file = file;
      }
    };
  }

  ngOnDestroy(): void {
    document.ondragover = null;
  }

  fill(e) {
    const file = e.target.files[0];
    if (file) {
      this.file = file;
    }
  }

  analysis() {
    this.analysising = true;
  }

  cancel() {
    this.modalService.confirm({
      nzTitle: '确认取消吗?',
      nzOnOk: () => {
        this.analysising = false;
      },
    });
  }

}
