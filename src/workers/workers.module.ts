import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { User, UserSchema } from '../users/schemas/user.schema';
import { Worker, WorkerSchema } from './schemas/worker.schema';
import { WorkersController } from './workers.controller';
import { WorkersService } from './workers.service';

@Module({
  imports: [MongooseModule.forFeature([
    { name: Worker.name, schema: WorkerSchema },
    { name: User.name, schema: UserSchema },
  ])],
  controllers: [WorkersController],
  providers: [WorkersService],
  exports: [WorkersService],
})
export class WorkersModule {}
