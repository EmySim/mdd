export interface Comment {
  id: number;
  content: string;
  createdAt: string;
  authorId: number; 
  authorUsername: string; 
  articleId: number;
  articleTitle: string; 
}

// CreateCommentRequest reste simple car articleId est dans l'URL
export interface CreateCommentRequest {
  content: string;
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