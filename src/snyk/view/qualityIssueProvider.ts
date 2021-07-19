import { AnalyzerInterface } from '../../interfaces/SnykInterfaces';
import { ISnykCode } from '../lib/modules/code';
import { IContextService } from '../services/contextService';
import { IViewManagerService } from '../services/viewManagerService';
import { IssueProvider } from './IssueProvider';

export class CodeQualityIssueProvider extends IssueProvider {
  constructor(
    protected viewManagerService: IViewManagerService,
    protected analyzer: AnalyzerInterface,
    protected contextService: IContextService,
    protected snykCode: ISnykCode,
  ) {
    super(viewManagerService, contextService, snykCode, analyzer.codeQualityReview);
  }
}
