export interface Comment {
  id: number;
  content: string;
  author: string;
  createdAt: string;
  updatedAt: string;
  articleId: number;
}

export interface CreateCommentRequest {
  content: string;
  articleId: number;
}

export interface UpdateCommentRequest {
  content: string;
}

export interface CommentsPage {
  content: Comment[];
  pageable: {
    sort: {
      empty: boolean;
      sorted: boolean;
      unsorted: boolean;
    };
    offset: number;
    pageSize: number;
    pageNumber: number;
    paged: boolean;
    unpaged: boolean;
  };
  totalElements: number;
  totalPages: number;
  size: number;
  number: number;
  sort: {
    empty: boolean;
    sorted: boolean;
    unsorted: boolean;
  };
  first: boolean;
  last: boolean;
  numberOfElements: number;
  empty: boolean;
}