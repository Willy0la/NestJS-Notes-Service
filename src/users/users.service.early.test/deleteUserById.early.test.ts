
import {
    InternalServerErrorException,
    NotFoundException
} from '@nestjs/common';
import { Error, Model } from 'mongoose';
import { FullBookModel } from '../schema/users.schema';
import { UsersService } from '../users.service';




// Mock for FullBookModel
const mockFullBookModel = {
  findByIdAndDelete: jest.fn(),
} as unknown as jest.Mocked<Model<FullBookModel>>;

describe('UsersService.deleteUserById() deleteUserById method', () => {
  let usersService: UsersService;

  beforeEach(() => {
    jest.clearAllMocks();
    usersService = new UsersService(mockFullBookModel);
  });

  // Happy Paths
  describe('Happy paths', () => {
    it('should delete a user by id and return the deleted user document', async () => {
      // This test ensures that when a valid user id is provided, the user is deleted and the deleted user document is returned.
      const mockUser = { _id: '123', name: 'Test User' } as any;
      jest.mocked(mockFullBookModel.findByIdAndDelete).mockReturnValue({
        exec: jest.fn().mockResolvedValue(mockUser as any),
      } as any);

      const result = await usersService.deleteUserById('123');
      expect(mockFullBookModel.findByIdAndDelete).toHaveBeenCalledWith('123');
      expect(result).toBe(mockUser);
    });
  });

  // Edge Cases
  describe('Edge cases', () => {
    it('should throw NotFoundException if user does not exist', async () => {
      // This test ensures that if the user does not exist, a NotFoundException is thrown.
      jest.mocked(mockFullBookModel.findByIdAndDelete).mockReturnValue({
        exec: jest.fn().mockResolvedValue(undefined),
      } as any);

      await expect(usersService.deleteUserById('nonexistent-id')).rejects.toThrow(
        NotFoundException,
      );
      expect(mockFullBookModel.findByIdAndDelete).toHaveBeenCalledWith('nonexistent-id');
    });

    it('should throw InternalServerErrorException if an unexpected error occurs', async () => {
      // This test ensures that if an unexpected error occurs during deletion, an InternalServerErrorException is thrown.
      jest.mocked(mockFullBookModel.findByIdAndDelete).mockReturnValue({
        exec: jest.fn().mockRejectedValue(new Error('DB error') as never),
      } as any);

      await expect(usersService.deleteUserById('123')).rejects.toThrow(
        InternalServerErrorException,
      );
      expect(mockFullBookModel.findByIdAndDelete).toHaveBeenCalledWith('123');
    });

    it('should throw InternalServerErrorException if findByIdAndDelete throws synchronously', async () => {
      // This test ensures that if findByIdAndDelete itself throws synchronously, an InternalServerErrorException is thrown.
      jest.mocked(mockFullBookModel.findByIdAndDelete).mockImplementation(() => {
        throw new Error('Synchronous error');
      });

      await expect(usersService.deleteUserById('123')).rejects.toThrow(
        InternalServerErrorException,
      );
      expect(mockFullBookModel.findByIdAndDelete).toHaveBeenCalledWith('123');
    });

    it('should handle string ids that look like ObjectIds', async () => {
      // This test ensures that string ids that look like MongoDB ObjectIds are handled correctly.
      const objectIdLike = '507f1f77bcf86cd799439011';
      const mockUser = { _id: objectIdLike, name: 'ObjectId User' } as any;
      jest.mocked(mockFullBookModel.findByIdAndDelete).mockReturnValue({
        exec: jest.fn().mockResolvedValue(mockUser as any),
      } as any);

      const result = await usersService.deleteUserById(objectIdLike);
      expect(mockFullBookModel.findByIdAndDelete).toHaveBeenCalledWith(objectIdLike);
      expect(result).toBe(mockUser);
    });

    it('should throw NotFoundException for empty string id', async () => {
      // This test ensures that an empty string id results in NotFoundException.
      jest.mocked(mockFullBookModel.findByIdAndDelete).mockReturnValue({
        exec: jest.fn().mockResolvedValue(undefined),
      } as any);

      await expect(usersService.deleteUserById('')).rejects.toThrow(NotFoundException);
      expect(mockFullBookModel.findByIdAndDelete).toHaveBeenCalledWith('');
    });
  });
});