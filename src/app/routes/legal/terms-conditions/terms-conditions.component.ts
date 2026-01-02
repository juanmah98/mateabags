import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-terms-conditions',
  standalone: true,
  imports: [CommonModule],
  template: `
     <div class="container py-5" style="min-height: 100dvh">
      <div class="row justify-content-center text-center">
        <div class="col-12">
          <img src="../../../assets/principales/comingsoon.jpg" class="img-fluid" width="700px" alt="">
        </div>
      </div>
    </div>
  `
})
export class TermsConditionsComponent { }
