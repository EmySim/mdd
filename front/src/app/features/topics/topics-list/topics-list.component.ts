import { Component, OnInit } from '@angular/core';
import { Topic } from '../../interfaces/topic.interface';

@Component({
  selector: 'app-topics-list',
  templateUrl: './topics-list.component.html',
  styleUrls: ['./topics-list.component.scss']
})
export class TopicsListComponent implements OnInit {

  constructor() { }

  ngOnInit(): void {
  }

}
