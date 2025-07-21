export interface Theme {
  id: number;
  name: string;
  createdAt: string;
  isSubscribed: boolean;
  description: string;
}

export interface ThemesPage {
  content: Theme[];
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

export interface CreateThemeRequest {
  name: string;
  description?: string;
}

export interface UpdateThemeRequest {
  name?: string;
  description?: string;
}