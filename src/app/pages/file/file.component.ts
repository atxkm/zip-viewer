import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-file-info',
  templateUrl: './file.component.html',
  styleUrls: ['./file.component.scss'],
})
export class FileComponent implements OnInit {

  view = 'list';
  searchValue;
  nodes = [
    {
      title: 'parent 1',
      key: '100',
      expanded: true,
      selectable: false,
      children: [
        { title: 'leaf', key: '1001', icon: 'anticon anticon-meh-o', isLeaf: true },
        { title: 'leaf', key: '1002', icon: 'anticon anticon-frown-o', isLeaf: true },
        { title: 'leaf', key: '1003', icon: 'anticon anticon-frown-o', isLeaf: true },
      ],
    },
  ];

  constructor() {
  }

  ngOnInit() {
  }

  onClickNode(e) {
    const node = e.node;
    console.log(e);
    if (!node.isLeaf) {
      node.isExpanded = !node.isExpanded;
    }
  }

}
