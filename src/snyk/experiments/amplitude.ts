/* eslint-disable camelcase */
import { Experiment, ExperimentClient, Variants } from '@amplitude/experiment-node-server';
import { userMe } from '../services/userService';

export class Amplitude {
  private experiment?: ExperimentClient;
  private variants: Variants;

  async init(): Promise<void> {
    // (1) Get your environment's API key
    const apiKey = 'client-PSkoi7KPEpo3LLERlcx1T8OFzRUfuSGZ';

    // (2) Initialize the experiment client
    this.experiment = Experiment.initialize(apiKey);

    const user = await userMe();
    this.variants = await this.experiment.fetch({
      user_id: user.id,
      platform: 'Visual Studio Code',
    });
  }

  isShowWelcomeMessageExperimentEnabled(): void {
    if (this.isExperimentEnabled('vs-code-show-welcome-message')) {
      console.log('experiment enabled');
    }
  }

  private isExperimentEnabled(flagKey: string): boolean {
    if (!this.variants) {
      throw new Error(`No variants were fetched.`);
    }

    const variant = this.variants[flagKey];

    return variant?.value === 'on';
  }
}
