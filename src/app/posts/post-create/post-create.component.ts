import { Component, OnInit, OnDestroy } from '@angular/core';
import { Subscription } from 'rxjs';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { ActivatedRoute, ParamMap } from '@angular/router';
import { DomSanitizer, SafeUrl } from '@angular/platform-browser';

import { PostsService } from '../../services';
import { AuthService } from '../../services';
import { Post } from '../../models/';
import { mimeType } from '../../shared/mime-type.validator';

@Component({
  selector: 'app-post-create',
  templateUrl: './post-create.component.html',
  styleUrls: ['./post-create.component.css'],
})
export class PostCreateComponent implements OnInit, OnDestroy {
  form: FormGroup = new FormGroup({});
  enteredTitle: string = '';
  enteredContent: string = '';
  mode: string = 'create';
  isLoading: boolean = false;
  imagePreview: string | ArrayBuffer | null = '';
  post: Post = {};

  private postId: string | null = null;
  private authStatusSub: Subscription = new Subscription();

  constructor(
    private postsService: PostsService,
    private route: ActivatedRoute,
    private sanitizer: DomSanitizer,
    private authService: AuthService
  ) {}

  ngOnInit(): void {
    this.authStatusSub = this.authService
      .getAuthStatusListener()
      .subscribe(() => {
        this.isLoading = false;
      });
    this.form = new FormGroup({
      title: new FormControl(null, {
        validators: [Validators.required, Validators.minLength(3)],
      }),
      content: new FormControl(null, {
        validators: [Validators.required, Validators.minLength(3)],
      }),
      image: new FormControl(null, {
        validators: [Validators.required],
        asyncValidators: [mimeType],
      }),
    });
    this.route.paramMap.subscribe((paramMap: ParamMap) => {
      if (paramMap.has('postId')) {
        this.mode = 'edit';
        this.postId = paramMap.get('postId');
        this.isLoading = true;
        this.postsService.getPost(this.postId).subscribe((postData) => {
          this.isLoading = false;
          this.post = {
            id: postData._id,
            title: postData.title,
            content: postData.content,
            imagePath: postData.imagePath,
            creator: postData.creator,
          };
          this.form.setValue({
            title: this.post.title,
            content: this.post.content,
            image: this.post.imagePath,
          });
        });
      } else {
        this.mode = 'create';
        this.postId = null;
      }
    });
  }

  ngOnDestroy(): void {
    this.authStatusSub.unsubscribe();
  }

  onSavePost(): void {
    if (this.form.invalid) {
      return;
    }

    this.isLoading = true;
    if (this.mode === 'create') {
      this.postsService.addPost(
        this.form.value.title,
        this.form.value.content,
        this.form.value.image
      );
    } else {
      this.postsService.updatePost(
        this.postId!,
        this.form.controls['title'].value,
        this.form.controls['content'].value,
        this.form.controls['image'].value
      );
    }

    this.form.reset();
  }

  onImagePicked(event: Event): void {
    const file: File | undefined = (event.target as HTMLInputElement)
      .files?.[0];
    this.form.patchValue({ image: file });
    this.form.get('image')?.updateValueAndValidity();
    const reader: FileReader = new FileReader();
    reader.onload = () => {
      this.imagePreview = reader.result;
      // const mimeString = this.imagePreviews
      //   .split(',')[0]
      //   .split(':')[1]
      //   .split(';')[0];
    };
    reader.readAsDataURL(file as Blob);
  }

  getSantizeUrl(url: string): SafeUrl {
    return this.sanitizer.bypassSecurityTrustUrl(url as string);
  }
}
