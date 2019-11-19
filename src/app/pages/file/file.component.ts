import { Component, NgZone, OnInit, ViewChild } from '@angular/core';
import { ElectronService } from 'ngx-electron';
import { ActivatedRoute } from '@angular/router';

@Component({
  selector: 'app-file-info',
  templateUrl: './file.component.html',
  styleUrls: ['./file.component.scss'],
})
export class FileComponent implements OnInit {

  @ViewChild('tree', { static: false }) tree;

  view = 'block';
  searchValue;
  nodes;
  nodes2;

  files;
  file;

  constructor(
    private electron: ElectronService,
    private ngZone: NgZone,
    private route: ActivatedRoute,
  ) {
  }

  ngOnInit() {
    const path = this.route.snapshot.queryParams.path;
    this.getDecryptFiles(path);
  }

  getDecryptFiles(path) {
    const files = this.electron.ipcRenderer.sendSync('message', { type: 'getFiles', data: { path } });
    if (files) {
      this.analyseFiles(files);
      const nodes = [{ title: '按路径展示', key: '2', children: files }];
      this.nodes = nodes;
      setTimeout(() => this.files = this.tree.getTreeNodes());
    }
  }

  analyseFiles(files) {
    files = Object.assign([], files);
    const nodes: any = [{
      title: '按类型展示', key: '1',
      children: [
        { title: '图片', icon: '', key: '10', sfx: ['jpg', 'png', 'gif'], children: [], isLeaf: true },
        { title: '视频', icon: '', key: '20', sfx: ['mp4', 'avi'], children: [], isLeaf: true },
        { title: '音频', icon: '', key: '30', sfx: ['mp3'], children: [], isLeaf: true },
        { title: '文本', icon: '', key: '40', sfx: ['txt'], children: [], isLeaf: true },
        // { title: '其他', key: '40', sfx: [], children: [] },
      ],
    }];
    this.loopFiles(files, nodes[0].children);
    for (const node of nodes[0].children) {
      node.type = node.title;
      node.title += `(${node.children.length})`;
    }
    this.nodes2 = nodes;
  }

  loopFiles(files, nodes) {
    for (const file of files) {
      file.key += '_node2';
      if (file.children) {
        this.loopFiles(file.children, nodes);
      } else {
        const node = nodes.find(item => {
          const sfx = String(file.title).split('.')[1];
          return item.sfx.indexOf(sfx) !== -1;
        });
        if (node) {
          node.children.push(file);
          // } else {
          //   nodes[3].files.push(file);
        }
      }
    }
  }

  onClickNode(e) {
    const node = e.node;
    const origin = node.origin;
    if (origin.children) {
      this.files = node.children;
      this.file = null;
      if (!origin.isLeaf) {
        node.isExpanded = !node.isExpanded;
      }
    } else {
      this.file = node;
      this.files = node.parentNode.children;
    }
  }

  // 中间部分的选择
  onSelect(item) {
    const origin = item.origin;
    if (origin.children) {
      this.files = item.children;
    } else {
      this.file = item;
    }
    item.isSelected = true;
    while (item.parentNode) {
      const parent = item.parentNode;
      if (parent.isLeaf) {
        parent.isSelected = true;
      } else {
        parent.isExpanded = true;
      }
      item = parent;
    }
  }

  exprtExcel() {
    const data = [
      ['类型', '数量'],
    ];
    const list = this.nodes2[0].children;
    for (const item of list) {
      data.push([item.type, item.files.length]);
    }
    this.electron.ipcRenderer.sendSync('message', { type: 'exportExcel', data: { data } });
  }

}
