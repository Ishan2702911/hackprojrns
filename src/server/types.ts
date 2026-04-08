export interface GitHubRepo {
  id: number;
  name: string;
  full_name: string;
  owner: {
    login: string;
    avatar_url: string;
  };
  description: string;
  html_url: string;
  updated_at: string;
}

export interface GitHubCommit {
  sha: string;
  commit: {
    message: string;
    author: {
      name: string;
      date: string;
    };
  };
}

export interface GitHubPR {
  number: number;
  title: string;
  user: {
    login: string;
  };
  state: string;
  created_at: string;
  updated_at: string;
  head: {
    ref: string;
  };
  base: {
    ref: string;
  };
}

export interface PRRelation {
  pr1: number;
  pr2: number;
  relation: string;
}

export interface Conflict {
  pr1: number;
  pr2: number;
  conflict: boolean;
  file: string;
}

export interface RepoAnalysis {
  relations: PRRelation[];
  conflicts: Conflict[];
  documentation: {
    features: string[];
    fixes: string[];
    improvements: string[];
  };
}
