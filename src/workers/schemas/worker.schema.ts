import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

@Schema({ timestamps: true })
export class Worker extends Document {
  // =========================
  // USER
  // =========================

  @Prop({
    type: Types.ObjectId,
    ref: 'User',
    required: true,
    unique: true,
  })
  userId!: Types.ObjectId;

  // =========================
  // PERSONAL INFORMATION
  // =========================

  @Prop()
  gender?: string;

  @Prop()
  birth?: Date;

  // =========================
  // PROFESSIONAL INFORMATION
  // =========================

  @Prop({
    type: [{ type: Types.ObjectId, ref: 'Category' }],
    default: [],
  })
  categories!: Types.ObjectId[];

  @Prop({ required: true })
  bio!: string;

  @Prop({ type: [String], default: [] })
  skills!: string[];

  @Prop({ type: [String], default: [] })
  achievements!: string[];

  @Prop({ default: 0, min: 0 })
  experienceYears!: number;

  // =========================
  // ADDRESS
  // =========================

  @Prop()
  province?: string;

  @Prop()
  district?: string;

  @Prop()
  village?: string;

  // =========================
  // LOCATION
  // =========================

  // GeoJSON Point
  // coordinates = [longitude, latitude]
  @Prop({
    type: {
      type: String,
      enum: ['Point'],
      default: 'Point',
    },
    coordinates: {
      type: [Number],
      required: true,
    },
  })
  location!: {
    type: string;
    coordinates: number[];
  };

  // =========================
  // VERIFICATION INFORMATION
  // =========================

  @Prop()
  certificate?: string;

  @Prop()
  documentType?: string;

  @Prop()
  documentId?: string;

  @Prop()
  issueDate?: Date;

  @Prop()
  expiryDate?: Date;

  @Prop({ type: [String], default: [] })
  documentImages!: string[];

  // =========================
  // WORKER STATUS
  // =========================

  @Prop({ default: true })
  isActive!: boolean;

  @Prop({ default: false })
  isAvailable!: boolean;

  @Prop({ default: false })
  isVerified!: boolean;

  // =========================
  // RATING
  // =========================

  @Prop({ default: 0, min: 0, max: 5 })
  ratingAvg!: number;

  @Prop({ default: 0, min: 0 })
  totalReviews!: number;
}

export const WorkerSchema = SchemaFactory.createForClass(Worker);

// Enable 2dsphere index for nearby-worker searches
WorkerSchema.index({ location: '2dsphere' });