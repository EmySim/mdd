// front/src/app/features/articles/create-article.component.ts
import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { ArticleService } from './article.service';
import { ThemeService } from '../themes/theme.service';
import { ErrorService } from '../../services/error.service';

@Component({
  selector: 'app-create-article',
  templateUrl: './create-article.component.html',
  styleUrls: ['./create-article.component.scss']
})
export class CreateArticleComponent implements OnInit {
  
  articleForm: FormGroup;
  themes: any[] = [];
  isSubmitting = false;

  constructor(
    private fb: FormBuilder,
    private articleService: ArticleService,
    private themeService: ThemeService,
    private errorService: ErrorService,
    private router: Router
  ) {
    this.articleForm = this.fb.group({
      title: [
        '', 
        [
          Validators.required, 
          Validators.minLength(5), 
          Validators.maxLength(200) // Limitation du titre à 200 caractères
        ]
      ],
      subjectId: ['', Validators.required],
      content: [
        '', 
        [
          Validators.required, 
          Validators.minLength(10), 
          Validators.maxLength(2000) // Limitation du contenu à 2000 caractères
        ]
      ]
    });
  }

  ngOnInit(): void {
    this.loadThemes();
  }

  private loadThemes(): void {
    this.themeService.getAllThemes().subscribe({
      next: (response) => {
        this.themes = response.content || [];
      },
      error: (error) => {
        this.errorService.handleHttpError(error);
      }
    });
  }

  onSubmit(): void {
    if (this.articleForm.valid) {
      this.isSubmitting = true;
      
      const articleData = {
        title: this.articleForm.value.title,
        content: this.articleForm.value.content,
        subjectId: parseInt(this.articleForm.value.subjectId)
      };

      this.articleService.createArticle(articleData).subscribe({
        next: () => {
          this.router.navigate(['/articles']);
        },
        error: (error) => {
          this.isSubmitting = false;
          this.errorService.handleHttpError(error);
        }
      });
    }
  }

  hasError(field: string): boolean {
    const control = this.articleForm.get(field);
    return !!(control && control.invalid && control.touched);
  }

  /**
   * Retour à la page précédente
   */
  goBack(): void {
    console.log('🔙 Retour à la page précédente');
    window.history.back();
  }
}