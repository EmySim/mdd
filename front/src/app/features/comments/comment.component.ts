// src/app/features/comments/comment.component.ts
import { Component, Input, OnInit, OnDestroy, OnChanges, SimpleChanges } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Subject, takeUntil } from 'rxjs';
import { CommentService } from './comment.service';
import { ErrorService } from '../../services/error.service';
import { Comment, CreateCommentRequest } from '../../interfaces/comment.interface'; 
import { AuthService } from '../../features/auth/auth.service';

@Component({
  selector: 'app-comment',
  templateUrl: './comment.component.html',
  styleUrls: ['./comment.component.scss']
})
export class CommentComponent implements OnInit, OnDestroy, OnChanges {

  @Input() articleId!: number;
  @Input() initialComments: Comment[] = [];

  comments: Comment[] = [];
  commentForm: FormGroup;
  isSubmitting = false;
  isLoading = false; 

  private destroy$ = new Subject<void>();

  constructor(
    private commentService: CommentService,
    private formBuilder: FormBuilder,
    public errorService: ErrorService,
    private authService: AuthService
  ) {
    this.commentForm = this.formBuilder.group({
      content: ['', [
        Validators.required, 
        Validators.minLength(3), 
        Validators.maxLength(500)
      ]]
    });
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['initialComments']?.currentValue) {
      this.comments = [...changes['initialComments'].currentValue];
    }
  }

  ngOnInit(): void {
    this.comments = [...this.initialComments];
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  onSubmitComment(): void {
    if (this.commentForm.valid && !this.isSubmitting) {
      const currentUser = this.authService.getCurrentUser();
      if (!currentUser) {
        alert("Vous devez être connecté pour laisser un commentaire.");
        return;
      }

      this.isSubmitting = true;

      const commentData: CreateCommentRequest = {
        content: this.commentForm.value.content.trim()
      };

      this.commentService.createComment(this.articleId, commentData).pipe(
        takeUntil(this.destroy$)
      ).subscribe({
        next: (newComment: Comment) => {
          this.comments.push(newComment);
          this.commentForm.reset();
          this.isSubmitting = false;
          this.commentForm.get('content')?.markAsUntouched();
          this.commentForm.get('content')?.markAsPristine();
        },
        error: (err) => {
          this.isSubmitting = false;
          this.errorService.handleHttpError(err);
        }
      });
    } else {
      this.commentForm.markAllAsTouched();
    }
  }

  hasFieldError(fieldName: string): boolean {
    const field = this.commentForm.get(fieldName);
    return !!(field && field.invalid && field.touched);
  }

  getFieldError(fieldName: string): string {
    const field = this.commentForm.get(fieldName);
    if (field?.errors?.['required']) return 'Le commentaire est obligatoire';
    if (field?.errors?.['minlength']) return `Minimum ${field.errors?.['minlength'].requiredLength} caractères`;
    if (field?.errors?.['maxlength']) return `Maximum ${field.errors?.['maxlength'].requiredLength} caractères`;
    return '';
  }

  trackByCommentId(index: number, comment: Comment): number {
    return comment.id;
  }
}
