import { Component, OnInit } from '@angular/core';
import { IonicModule } from '@ionic/angular';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-forecast-page',
  templateUrl: './forecast-page.page.html',
  styleUrls: ['./forecast-page.page.scss'],
  standalone: true,
  imports: [IonicModule, FormsModule, CommonModule],
})
export class ForecastPagePage implements OnInit {

  constructor() { }

  ngOnInit() {
  }

}
