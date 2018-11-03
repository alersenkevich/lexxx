import { Document, Schema, Model, model } from 'mongoose';

export interface IStatistic {
  product: string;
  createdAt: string;
  exchanges: {
    title: string;
    bid: number;
    ask: number;
  }[];
}

export interface IStatisticModel extends IStatistic, Document {}

export const StatisticSchema: Schema = new Schema({
  createdAt: Date,
  product: String,
  exchanges: [{
    title: String,
    bid: Number,
    ask: Number,
  }],
});

export const Statistic: Model<IStatisticModel> =
  model<IStatisticModel>('Statistic', StatisticSchema);
