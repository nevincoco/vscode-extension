import { spawn } from 'child_process';
import { configuration } from '../configuration';
import { Logger } from '../logger';

export class Cli {
  scan(downloadPath: string) {
    const cli = spawn(downloadPath, ['test', '--json'], {
      cwd: '/Users/michel/Git/goof',
      env: {
        SNYK_INTEGRATION_NAME: 'Visual Studio Code',
        SNYK_INTEGRATION_VERSION: '',
        SNYK_TOKEN: configuration.token,
      },
    });
    let i = 1;
    cli.stdout.on('data', (data: any) => {
      Logger.info(`stdout: ${data}`);
      i++;
    });

    cli.stderr.on('data', data => {
      Logger.error(`stderr: ${data}`);
    });

    cli.on('close', code => {
      Logger.info(`child process exited with code ${code}, i: ${i}`);
    });
  }
}
