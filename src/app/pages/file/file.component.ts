import { AfterViewInit, Component, OnInit, ViewChild } from '@angular/core';

@Component({
  selector: 'app-file-info',
  templateUrl: './file.component.html',
  styleUrls: ['./file.component.scss'],
})
export class FileComponent implements OnInit, AfterViewInit {

  @ViewChild('tree', { static: false }) tree;

  view = 'block';
  searchValue;
  nodes = [
    {
      title: 'storage', key: '100', expanded: true,
      children: [
        {
          title: 'emulated', key: '1000', expanded: true,
          children: [
            {
              title: '0', key: '10000', expanded: true,
              children: [
                {
                  title: 'DCIM', key: '100000', expanded: true,
                  children: [
                    {
                      title: 'Camera', key: '1000000', expanded: true,
                      children: [
                        { title: '20191029_141408.mp4', key: '10000000', icon: 'video-camera', isLeaf: true, size: '20M', date: '2019-11-01', type: '视频' },
                        { title: '20191029_141412.mp4', key: '10000001', icon: 'video-camera', isLeaf: true, size: '30M', date: '2019-11-01', type: '视频' },
                        { title: '20191029_141123.mp4', key: '10000002', icon: 'video-camera', isLeaf: true, size: '40M', date: '2019-11-01', type: '视频' },
                      ],
                    },
                  ],
                },
              ],
            },
          ],
        },
      ],
    },
  ];
  files;
  file;

  constructor() {
  }

  ngOnInit() {
  }

  ngAfterViewInit(): void {
    setTimeout(() => this.files = this.tree.getTreeNodes());
  }

  onClickNode(e) {
    const node = e.node;
    if (node.isLeaf) {
      this.files = [node];
      this.file = node;
    } else {
      this.files = node.children;
    }
  }

  onSelect(item) {
    if (item.isLeaf) {
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
