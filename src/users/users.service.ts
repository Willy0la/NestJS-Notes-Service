import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { UserDocument, UserModel } from './schema/users.schema';
import mongoose, { Error, Model } from 'mongoose';
import { CreateUserDto } from './user-dto/create-user.dto';
import * as bcrypt from 'bcrypt';
import { LoginUserDto } from './user-dto/login-user.dto';
import { UpdateUserDto } from './user-dto/update-user.dto';
import { Redis } from 'ioredis';
import { Logger } from '@nestjs/common';
import { RedisService } from '../redis/redis.service';
import { generateUserKey } from 'src/utils/utils';
import { CACHE_TTL_NOTES } from 'src/notes/notes.constant';

@Injectable()
export class UsersService {
  private readonly redis: Redis;
  private readonly logger = new Logger(UsersService.name);
  constructor(
    @InjectModel(UserModel.name)
    private readonly userModel: Model<UserDocument>,
    private readonly redisClient: RedisService,
  ) {
    this.redis = this.redisClient.getClient();
    this.logger.log('Connected to Redis');
    this.redis.on('error', (err) => {
      this.logger.error('Redis connection error', err);
    });
  }

  async registerUser(
    createUser: CreateUserDto,
  ): Promise<{ data: UserDocument; message: string; success: boolean }> {
    try {
      const { username, email, name, password } = createUser;

      const user = await this.userModel.findOne({ email });
      if (user) {
        throw new BadRequestException(
          'User with this email already exists. Please log in or use a different email',
        );
      }

      const hashedPassword = await bcrypt.hash(password, 12);
      const newUser = await this.userModel.create({
        username: username,
        email: email,
        name: name,
        password: hashedPassword,
      });
      const userObject = newUser.toObject();
      delete userObject.password;
      this.logger.log(`User with email: ${email} registered successfully`);
      return {
        data: userObject,
        message: 'User registered successfully',
        success: true,
      };
    } catch (error: unknown) {
      console.error(error);

      throw new InternalServerErrorException('Unable to create new user');
    }
  }

  async login(
    userLogin: LoginUserDto,
  ): Promise<{ data: UserDocument; message: string; success: boolean }> {
    const { username, password } = userLogin;

    try {
      const user = await this.userModel
        .findOne({ username })
        .select('+password')
        .exec();
      if (!user) {
        throw new BadRequestException(
          `User with  this username: ${username} does not exist`,
        );
      }
      if (!user.password) {
        throw new InternalServerErrorException(`User password is not set`);
      }
      const isPasswordMatch = await bcrypt.compare(password, user.password);
      if (!isPasswordMatch) {
        throw new ForbiddenException('Incorrect password');
      }

      const userObject = user.toObject();
      delete userObject.password;
      this.logger.log(`User with username: ${username} logged in successfully`);

      return {
        data: userObject,
        message: 'Login successful',
        success: true,
      };
    } catch (error) {
      console.error(error);
      throw new InternalServerErrorException(`Unable to log in user`);
    }
  }

  async updateUser(
    id: string,
    updateUser: UpdateUserDto,
  ): Promise<UserDocument> {
    try {
      const cacheKey = generateUserKey(id);
      const cachedUser = await this.redis.get(cacheKey);
      if (cachedUser) {
        this.logger.log(`User with id ${id} found in cache`);
        return JSON.parse(cachedUser) as UserDocument;
      }
      if (!mongoose.Types.ObjectId.isValid(id)) {
        throw new BadRequestException(`Invalid user ID: ${id}`);
      }
      const user = await this.userModel.findById(id).exec();
      if (!user) {
        throw new NotFoundException(`User with id: ${id} does not exist`);
      }
      const updated = await this.userModel
        .findByIdAndUpdate(id, updateUser, {
          new: true,
          runValidators: true,
        })
        .exec();
      if (!updated) {
        throw new BadRequestException('Unable to update user');
      }
      const updatedPlain = updated.toObject();
      this.logger.debug(`Cache miss → ${cacheKey}`);

      await this.redis.set(
        cacheKey,
        JSON.stringify(updatedPlain),
        'EX',
        CACHE_TTL_NOTES,
      );
      this.logger.debug(`User with id ${id} cached successfully`);
      this.logger.log(`Updated user with id ${id} successfully`);
      updated.password = 'hidden';
      this.logger.log(`User with id ${id} successfully updated 😍`);
      return updated;
    } catch (error) {
      console.error(error);
      throw new InternalServerErrorException(`Unable to update user`);
    }
  }

  async getAllUsers(): Promise<UserDocument[]> {
    try {
      const allUsers = await this.userModel.find({}, { password: 0 }).exec();
      return allUsers;
    } catch (error) {
      console.error(error);
      throw new InternalServerErrorException(`Unable to get all users`);
    }
  }

  async getUserById(id: string): Promise<Partial<UserDocument>> {
    try {
      const cacheKey = generateUserKey(id);
      const cachedUser = await this.redis.get(cacheKey);
      if (cachedUser) {
        this.logger.log(`User with id ${id} found in cache`);
        return JSON.parse(cachedUser) as UserDocument;
      }
      const user = await this.userModel.findById(id, { password: 0 }).exec();

      if (!mongoose.Types.ObjectId.isValid(id)) {
        throw new BadRequestException(`Invalid user ID: ${id}`);
      }
      if (!user) {
        throw new NotFoundException(`User with id: ${id} not found`);
      }
      const userPlain = user.toObject();

      this.logger.debug(`Cache miss → ${cacheKey}`);

      await this.redis.set(
        cacheKey,
        JSON.stringify(userPlain),
        'EX',
        CACHE_TTL_NOTES,
      );
      this.logger.debug(`User with id ${id} cached successfully`);
      return userPlain;
    } catch (error) {
      console.error(error);
      throw new InternalServerErrorException(`Unable to get user by id`);
    }
  }
  async deleteUserById(id: string): Promise<UserDocument> {
    try {
      if (!mongoose.Types.ObjectId.isValid(id)) {
        throw new BadRequestException(`Invalid user ID: ${id}`);
      }
      const user = await this.userModel.findByIdAndDelete(id).exec();

      if (!user) {
        throw new NotFoundException(`User with id: ${id} not found`);
      }

      return user;
    } catch (error) {
      console.error(error);
      throw new InternalServerErrorException(`Unable to delete user`);
    }
  }
}
