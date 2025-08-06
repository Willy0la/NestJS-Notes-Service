
import {
    BadRequestException,
    ForbiddenException,
    InternalServerErrorException
} from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { Error } from 'mongoose';
import { UsersService } from '../users.service';


// src/users/users.service.login.spec.ts


// src/users/users.service.login.spec.ts
// --- Manual Mocks ---

// Mock for mongoose Model
class MockModel {
  public findOne = jest.fn();
  constructor() {}
}

// Mock for FullBookModelDocument
class MockFullBookModelDocument {
  public username: string = 'testuser';
  public password: string = 'hashedpassword';
  // Simulate mongoose Document methods if needed
  public exec = jest.fn();
}

// Mock for LoginUserDto

// --- Begin Tests ---

describe('UsersService.login() login method', () => {
  let service: UsersService;
  let mockModel: MockModel;

  beforeEach(() => {
    mockModel = new MockModel();
    service = new UsersService(mockModel as any);
    jest.clearAllMocks();
  });

  // --- Happy Paths ---

  it('should successfully login with correct username and password', async () => {
    // This test ensures that a valid user and correct password returns the user object without the password field.
    const mockUser = new MockFullBookModelDocument();
    mockUser.password = 'hashedpassword';
    jest.mocked(mockModel.findOne).mockReturnValue({
      exec: jest.fn().mockResolvedValue(mockUser as any),
    } as any);

    jest.spyOn(bcrypt, 'compare').mockResolvedValue(true);

    const loginDto = { username: 'testuser', password: 'testpassword' } as any;

    const result = await service.login(loginDto);

    expect(mockModel.findOne).toHaveBeenCalledWith({ username: 'testuser' });
    expect(bcrypt.compare).toHaveBeenCalledWith('testpassword', 'hashedpassword');
    expect(result).toBe(mockUser);
    expect(result.password).toBeUndefined();
  });

  // --- Edge Cases ---

  it('should throw BadRequestException if username is missing', async () => {
    // This test checks that missing username throws BadRequestException.
    const loginDto = { password: 'testpassword' } as any;

    await expect(service.login(loginDto)).rejects.toThrow(BadRequestException);
    await expect(service.login(loginDto)).rejects.toThrow('Kindly input your required details ');
  });

  it('should throw BadRequestException if password is missing', async () => {
    // This test checks that missing password throws BadRequestException.
    const loginDto = { username: 'testuser' } as any;

    await expect(service.login(loginDto)).rejects.toThrow(BadRequestException);
    await expect(service.login(loginDto)).rejects.toThrow('Kindly input your required details ');
  });

  it('should throw BadRequestException if user does not exist', async () => {
    // This test checks that a non-existent user throws BadRequestException.
    jest.mocked(mockModel.findOne).mockReturnValue({
      exec: jest.fn().mockResolvedValue(undefined),
    } as any);

    const loginDto = { username: 'nouser', password: 'testpassword' } as any;

    await expect(service.login(loginDto)).rejects.toThrow(BadRequestException);
    await expect(service.login(loginDto)).rejects.toThrow('User with  this username: nouser does not exist');
  });

  it('should throw ForbiddenException if password does not match', async () => {
    // This test checks that an incorrect password throws ForbiddenException.
    const mockUser = new MockFullBookModelDocument();
    mockUser.password = 'hashedpassword';
    jest.mocked(mockModel.findOne).mockReturnValue({
      exec: jest.fn().mockResolvedValue(mockUser as any),
    } as any);

    jest.spyOn(bcrypt, 'compare').mockResolvedValue(false);

    const loginDto = { username: 'testuser', password: 'wrongpassword' } as any;

    await expect(service.login(loginDto)).rejects.toThrow(ForbiddenException);
    await expect(service.login(loginDto)).rejects.toThrow('Password is wrong');
  });

  it('should throw InternalServerErrorException if an unexpected error occurs', async () => {
    // This test checks that any unexpected error in the try block throws InternalServerErrorException.
    jest.mocked(mockModel.findOne).mockImplementation(() => {
      throw new Error('Unexpected DB error');
    });

    const loginDto = { username: 'testuser', password: 'testpassword' } as any;

    await expect(service.login(loginDto)).rejects.toThrow(InternalServerErrorException);
    await expect(service.login(loginDto)).rejects.toThrow('Unable to log in user');
  });

  it('should throw InternalServerErrorException if bcrypt.compare throws', async () => {
    // This test checks that an error thrown by bcrypt.compare is caught and rethrown as InternalServerErrorException.
    const mockUser = new MockFullBookModelDocument();
    mockUser.password = 'hashedpassword';
    jest.mocked(mockModel.findOne).mockReturnValue({
      exec: jest.fn().mockResolvedValue(mockUser as any),
    } as any);

    jest.spyOn(bcrypt, 'compare').mockRejectedValue(new Error('bcrypt error'));

    const loginDto = { username: 'testuser', password: 'testpassword' } as any;

    await expect(service.login(loginDto)).rejects.toThrow(InternalServerErrorException);
    await expect(service.login(loginDto)).rejects.toThrow('Unable to log in user');
  });

  it('should remove password from the returned user object', async () => {
    // This test ensures that the password field is removed from the returned user object.
    const mockUser = new MockFullBookModelDocument();
    mockUser.password = 'hashedpassword';
    jest.mocked(mockModel.findOne).mockReturnValue({
      exec: jest.fn().mockResolvedValue(mockUser as any),
    } as any);

    jest.spyOn(bcrypt, 'compare').mockResolvedValue(true);

    const loginDto = { username: 'testuser', password: 'testpassword' } as any;

    const result = await service.login(loginDto);

    expect(result.password).toBeUndefined();
  });
});