import { Component } from '@angular/core';
import { NavComponent } from './nav.component';

@Component({
  selector: 'nsw-info',
  standalone: true,
  imports: [NavComponent],
  templateUrl: './info.component.html',
  styleUrls: ['./info.component.css']
})
export class InfoComponent {}
