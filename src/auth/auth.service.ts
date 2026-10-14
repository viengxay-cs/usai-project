import {
  BadRequestException,
  ConflictException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { InjectModel } from '@nestjs/mongoose';
import * as bcrypt from 'bcrypt';
import { Model } from 'mongoose';
import { SigninDto } from './dto/signin.dto';
import { SignupDto } from './dto/signup.dto';
import { User, UserRole } from '../users/schemas/user.schema';
import { UsersService } from '../users/users.service';

@Injectable()
export class AuthService {
  constructor(
    private readonly usersService: UsersService,
    private readonly jwtService: JwtService,
    @InjectModel(User.name) private readonly userModel: Model<User>,
  ) {}

  async register(dto: SignupDto) {
    const fullName = dto.fullName.trim();
    const phone = dto.phone.trim();
    const email = dto.email.trim().toLowerCase();

    if (!fullName || !phone || !email || !dto.password) {
      throw new BadRequestException('fullName, phone, email, and password are required');
    }

    const existingUser = await this.usersService.findByPhone(phone);
    if (existingUser) {
      throw new ConflictException('Phone number is already registered');
    }

    const passwordHash = await bcrypt.hash(dto.password, 12);

    // Never trust the client to choose a privileged role.
    // New accounts always start as CUSTOMER. Promotion to WORKER/ADMIN
    // must happen through a protected admin workflow.
    const newUser = await this.userModel.create({
      fullName,
      phone,
      email,
      passwordHash,
      role: UserRole.CUSTOMER,
    });

    const result = newUser.toObject() as any;
    delete result.passwordHash;

    return {
      message: 'Register successful',
      user: result,
    };
  }

  async login(dto: SigninDto) {
    const phone = dto.phone.trim();
    const user = await this.usersService.findByPhone(phone);

    if (!user) {
      throw new UnauthorizedException('Invalid phone number or password');
    }

    const isPasswordValid = await bcrypt.compare(dto.password, user.passwordHash);
    if (!isPasswordValid) {
      throw new UnauthorizedException('Invalid phone number or password');
    }

    const payload = {
      sub: user._id.toString(),
      phone: user.phone,
      email: user.email,
      role: user.role,
    };

    const accessToken = this.jwtService.sign(payload);

    return {
      message: 'Login successful',
      accessToken,
      user: {
        id: user._id,
        fullName: user.fullName,
        phone: user.phone,
        email: user.email,
        role: user.role,
      },
    };
  }
}
