import axios, { AxiosInstance } from 'axios';
import { Logger } from '../../logger';
import fs from 'fs';
import * as stream from 'stream';
import { promisify } from 'util';
import { Stream } from 'stream';
import path from 'path';
const finished = promisify(stream.finished);

export interface IReleaseInfo {
  id: number;
  url: string;
  name: string;
  // eslint-disable-next-line camelcase
  tag_name: string;
}

export class GithubApiClient {
  private instance: AxiosInstance | null = null;

  private get http(): AxiosInstance {
    return this.instance != null ? this.instance : this.initHttp();
  }

  initHttp(): AxiosInstance {
    const http = axios.create();

    http.interceptors.response.use(
      response => response,
      error => {
        Logger.error(`Call to Github API failed: ${error}`);
        return Promise.reject(error);
      },
    );

    this.instance = http;
    return http;
  }

  async getLatestReleaseInfo(): Promise<IReleaseInfo> {
    return (await this.http.get('https://api.github.com/repos/snyk/snyk/releases/latest')).data as IReleaseInfo;
  }

  // https://stackoverflow.com/questions/55374755/node-js-axios-download-file-stream-and-writefile
  async getLatestReleaseBinary(tag: string, platform: string, outputLocationPath: string): Promise<string> {
    const downloadPath = path.join(outputLocationPath, platform);
    const writer = fs.createWriteStream(path.join(outputLocationPath, platform), {
      mode: 0o744,
    });
    return this.http
      .get<Stream>(`https://github.com/snyk/snyk/releases/download/${tag}/${platform}`, {
        responseType: 'stream',
      })
      .then(async response => {
        response.data.pipe(writer);
        return finished(writer);
      })
      .then(() => downloadPath);
  }
}
