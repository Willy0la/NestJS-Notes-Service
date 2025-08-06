import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
} from '@nestjs/common';
import { UsersService } from './users.service';
import { CreateUserDto } from './user-dto/create-user.dto';
import { LoginUserDto } from './user-dto/login-user.dto';
import { UpdateUserDto } from './user-dto/update-user.dto';

@Controller('users')
export class UsersController {
  constructor(private readonly userService: UsersService) {}

  @Post('register')
  async registerUser(@Body() createUser: CreateUserDto) {
    return await this.userService.registerUser(createUser);
  }

  @Post('login')
  async login(@Body() userLogin: LoginUserDto) {
    return this.userService.login(userLogin);
  }

  @Patch(':id')
  async updateUser(@Body() @Param('id') id: string, updateUser: UpdateUserDto) {
    return this.userService.updateUser(id, updateUser);
  }

  @Get('')
  async getAllUsers() {
    return this.userService.getAllUsers();
  }
  @Get(':id')
  async getUserById(@Param('id') id: string) {
    return this.userService.getUserById(id);
  }
  @Delete(':id')
  async deleteUserById(@Param('id') id: string) {
    return this.userService.deleteUserById(id);
  }
}
