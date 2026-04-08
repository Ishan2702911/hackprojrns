import axios from "axios";
import { GitHubRepo, GitHubCommit, GitHubPR } from "../types";

export class GitHubService {
  private static BASE_URL = "https://api.github.com";

  private static getHeaders(token?: string) {
    const authToken = token || process.env.GITHUB_TOKEN;
    const headers: any = {
      "Accept": "application/vnd.github.v3+json",
    };
    if (authToken) {
      headers["Authorization"] = `token ${authToken}`;
    }
    return headers;
  }

  static async getRepos(token: string): Promise<GitHubRepo[]> {
    const response = await axios.get(`${this.BASE_URL}/user/repos`, {
      headers: this.getHeaders(token),
      params: { sort: "updated", per_page: 100 },
    });
    return response.data;
  }

  static async getCommits(token: string | undefined, owner: string, repo: string): Promise<GitHubCommit[]> {
    const response = await axios.get(`${this.BASE_URL}/repos/${owner}/${repo}/commits`, {
      headers: this.getHeaders(token),
      params: { per_page: 50 },
    });
    return response.data;
  }

  static async getPRs(token: string | undefined, owner: string, repo: string): Promise<GitHubPR[]> {
    const response = await axios.get(`${this.BASE_URL}/repos/${owner}/${repo}/pulls`, {
      headers: this.getHeaders(token),
      params: { state: "all", per_page: 50 },
    });
    return response.data;
  }

  static async getPRFiles(token: string | undefined, owner: string, repo: string, prNumber: number): Promise<string[]> {
    const response = await axios.get(`${this.BASE_URL}/repos/${owner}/${repo}/pulls/${prNumber}/files`, {
      headers: this.getHeaders(token),
    });
    return response.data.map((file: any) => file.filename);
  }
}
