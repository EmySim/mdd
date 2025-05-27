import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Topic } from '../../interfaces/topic.interface';

@Injectable({
  providedIn: 'root'
})
export class TopicService {
  constructor(private http: HttpClient) {}

  getTopics(): Observable<Topic[]> {
    return this.http.get<Topic[]>('/api/topics');
  }
}
