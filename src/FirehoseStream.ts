import { AWSError, Firehose } from 'aws-sdk';
import _ from 'lodash';
import { Writable } from 'stream';

import { IFirehoseStreamConfig, WriteCallback } from './interfaces';

export class FirehoseStream extends Writable {
  private readonly defaults: Partial<IFirehoseStreamConfig> = {
    firehoseConfig: {
      region: 'us-east-1',
    },
  };
  private readonly firehose: Firehose;

  constructor(private readonly config: Partial<IFirehoseStreamConfig>) {
    super();
    this.config = _.merge(this.defaults, config);
    this.firehose = new Firehose(this.config.firehoseConfig);
  }

  // tslint:disable:no-any
  public write(chunk: any, cb?: (error: Error | null | undefined) => void): boolean;
  public write(chunk: any, encoding?: string, cb?: WriteCallback): boolean;
  public write(paramA: any, paramB?: string | WriteCallback, paramC?: WriteCallback): boolean {
    const chunk: any = paramA;
    let encoding: string | undefined;
    let cb: WriteCallback | undefined;
    // tslint:enable:no-any

    if (typeof paramB === 'string') {
      encoding = paramB;
      cb = paramC;
    } else {
      cb = paramB;
    }

    const parsed: string = this.parseChunk(chunk);
    const params: Firehose.PutRecordInput = {
      DeliveryStreamName: this.config.streamName || '',
      Record: {
        Data: parsed,
      },
    };
    this.firehose.putRecord(params, (error: AWSError, data: Firehose.PutRecordOutput) => {
      if (cb) {
        cb(error || undefined);
      }
    });
    return true;
  }

  private parseChunk(chunk: Buffer | {} | string): string {
    let parsed: string;
    if (Buffer.isBuffer(chunk)) {
      parsed = chunk.toString();
    } else if (typeof chunk === 'object') {
      parsed = JSON.stringify(chunk);
    } else {
      parsed = chunk;
    }
    return parsed;
  }
}
