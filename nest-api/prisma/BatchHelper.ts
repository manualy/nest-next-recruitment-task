export class BatchPoolHelper {
  poolSize: number;
  currentIndex: number;
  batchQueuePool: Promise<unknown>[];
  poolTracker: {
    promise: Promise<unknown>;
    resolve: (value?: unknown) => void;
    reject: (reason: unknown) => void;
  }[];

  constructor(poolSize: number) {
    if (poolSize < 1) {
      throw 'Wrong poolSize number';
    }

    this.poolSize = poolSize;
    this.currentIndex = 0;
    this.batchQueuePool = Array.from({ length: poolSize }, () =>
      Promise.resolve(),
    );

    this.poolTracker = Array.from({ length: poolSize }, () => {
      let resolve: (value?: unknown) => void;
      let reject: (reason?: unknown) => void;
      const promise = new Promise<unknown>((res, rej) => {
        resolve = res;
        reject = rej;
      });
      return { promise, resolve: resolve!, reject: reject! };
    });
  }

  enqueue(processFunction: () => Promise<unknown>) {
    if (this.currentIndex === this.poolSize) {
      this.currentIndex = 0;
    }

    const indexCopy = this.currentIndex;

    this.batchQueuePool[this.currentIndex] = this.batchQueuePool[
      this.currentIndex
    ].then(
      async () =>
        await processFunction().catch((err) => {
          this.poolTracker[indexCopy].reject(err);
        }),
    );

    this.currentIndex += 1;
  }

  finalize() {
    this.batchQueuePool.forEach((promiseChain, index) => {
      promiseChain = promiseChain.then(() => this.poolTracker[index].resolve());
    });
  }

  async queueProcessed() {
    await Promise.all(this.poolTracker.map((tracker) => tracker.promise));
    return;
  }
}
