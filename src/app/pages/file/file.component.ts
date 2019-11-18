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
    const nodes = [{
      title: '按类型展示', key: '1',
      children: [
        { title: '图片', icon: '', key: '10', sfx: ['jpg', 'png', 'gif'], files: [], isLeaf: true },
        { title: '视频', icon: '', key: '20', sfx: ['mp4', 'avi'], files: [], isLeaf: true },
        { title: '音频', icon: '', key: '30', sfx: ['mp3'], files: [], isLeaf: true },
        { title: '文本', icon: '', key: '40', sfx: ['txt'], files: [], isLeaf: true },
        // { title: '其他', key: '40', sfx: [], children: [] },
      ],
    }];
    this.loopFiles(files, nodes[0].children);
    for (const node of nodes[0].children) {
      node.title += `(${node.files.length + 1})`;
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
          node.files.push(file);
          // } else {
          //   nodes[3].files.push(file);
        }
      }
    }
  }

  onClickNode(e) {
    const node = e.node;
    if (node.origin.files) {
      this.files = node.origin.files;
    } else if (node.isLeaf) {
      this.file = node;
    } else {
      node.isExpanded = !node.isExpanded;
      this.files = node.origin.children;
      this.file = null;
    }
  }

  onSelect(item) {
    if (item.files) {
      this.files = item.files;
    } else if (item.isLeaf) {
      this.file = item;
    } else {
      this.files = item.children;
    }
    item.isSelected = true;
    while (item.parentNode) {
      item.parentNode.isExpanded = true;
      item = item.parentNode;
    }
  }

}
