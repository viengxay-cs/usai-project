import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export enum BookingStatus {
  PENDING = 'PENDING',
  ACCEPTED = 'ACCEPTED',
  REJECTED = 'REJECTED',
  IN_PROGRESS = 'IN_PROGRESS',
  COMPLETED = 'COMPLETED',
  CANCELLED = 'CANCELLED',
}

@Schema({ timestamps: true })
export class Booking extends Document {
  @Prop({ type: Types.ObjectId, ref: 'User', required: true })
  customerId!: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'Worker', required: true })
  workerId!: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'Category', required: true })
  categoryId!: Types.ObjectId;

  @Prop({ required: true })
  description!: string;

  @Prop({ required: true })
  scheduledDate!: Date;

  @Prop({
    type: {
      type: String,
      enum: ['Point'],
      default: 'Point',
    },
    coordinates: [Number], // Job location
  })
  location!: {
    type: string;
    coordinates: number[];
  };

  @Prop({ type: String, enum: BookingStatus, default: BookingStatus.PENDING })
  status!: BookingStatus;

  @Prop()
  priceEstimate?: number;
}

export const BookingSchema = SchemaFactory.createForClass(Booking);
// Enable geospatial queries on job locations.
BookingSchema.index({ location: '2dsphere' });
