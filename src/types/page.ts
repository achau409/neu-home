export interface Page {
  title: string;
  slug: string;
  content: string;
  isHomePage: boolean;
}

export interface ContentBlock {
  blockType: string;
  [key: string]: any;
}

export interface HomePageData {
  content: ContentBlock[];
  [key: string]: any;
}
