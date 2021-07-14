import { strictEqual } from 'assert';
import { PendingTask } from '../../../snyk/utils/pendingTask';

suite('Pending Task', () => {
  let task: PendingTask;

  setup(() => {
    task = new PendingTask();
  });

  test('new pending task completes', async () => {
    task.complete();

    await task.waiter;
    strictEqual(task.isCompleted, true);
  });

  test('Awaited pending task completes', done => {
    task.waiter
      .then(() => {
        strictEqual(task.isCompleted, true);
        done();
      })
      .catch(err => {
        done(err);
      });

    task.complete();
  });

  test("New pending task doesn't complete", () => {
    strictEqual(task.isCompleted, false);
  });
});
