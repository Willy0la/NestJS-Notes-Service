import {
  BadRequestException,
  ConflictException,
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

@Injectable()
export class UsersService {
  constructor(
    @InjectModel(UserModel.name)
    private readonly userModel: Model<UserDocument>,
  ) {}

  async registerUser(createUser: CreateUserDto): Promise<UserDocument> {
    try {
      const { username, email, name, password } = createUser;
      const user = await this.userModel.findOne({ email });
      if (user) {
        throw new BadRequestException(
          'User with this email already exists. Please log in or use a different email',
        );
      }
      const existingUsername = await this.userModel
        .findOne({ username })
        .exec();
      if (existingUsername) {
        throw new ConflictException('Username is already taken');
      }

      const hashedPassword = await bcrypt.hash(password, 12);
      return await this.userModel.create({
        username: username,
        email: email,
        name: name,
        password: hashedPassword,
      });
    } catch (error: unknown) {
      console.error(error);

      throw new InternalServerErrorException('Unable to create new user');
    }
  }

  async login(userLogin: LoginUserDto): Promise<UserDocument> {
    const { username, password } = userLogin;
    if (!username || !password) {
      throw new BadRequestException('Kindly input your required details ');
    }
    try {
      const user = await this.userModel.findOne({ username }).exec();
      if (!user) {
        throw new BadRequestException(
          `User with  this username: ${username} does not exist`,
        );
      }
      const isPasswordMatch = await bcrypt.compare(password, user.password);
      if (!isPasswordMatch) {
        throw new ForbiddenException(`Password is wrong`);
      }
      user.password = password;

      return user;
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

  async getUserById(id: string): Promise<UserDocument> {
    try {
      const user = await this.userModel.findById(id, { password: 0 }).exec();

      if (!mongoose.Types.ObjectId.isValid(id)) {
        throw new BadRequestException(`Invalid user ID: ${id}`);
      }
      if (!user) {
        throw new NotFoundException(`User with id: ${id} not found`);
      }

      return user;
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
