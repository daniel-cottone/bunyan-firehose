import { Firehose } from 'aws-sdk';

export interface IFirehoseStreamConfig {
  streamName: string;
  firehoseConfig: Firehose.ClientConfiguration;
}

export type WriteCallback = (error: Error | null | undefined) => void;
