import {
  BadRequestException,
  ImATeapotException,
  Injectable,
  InternalServerErrorException,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Note, NoteDocument } from 'src/users/schema/note.schema';
import { CreateNoteDto } from './note-dto/create-note.dto';
import mongoose, { Model } from 'mongoose';
import { UpdateNoteDto } from './note-dto/update-note.dto';

@Injectable()
export class NotesService {
  private readonly logger = new Logger(NotesService.name);
  constructor(
    @InjectModel(Note.name) private readonly noteModel: Model<NoteDocument>,
  ) {}
  async createNote(
    createDto: CreateNoteDto,
  ): Promise<{ data: NoteDocument; message: string }> {
    try {
      const { title, content, userId } = createDto;

      const findTitle = await this.noteModel.findOne({
        title: new RegExp(`^${title}$`, 'i'),
      });

      if (findTitle) {
        throw new ImATeapotException('the title name already exist 😂😂 ');
      }

      const note = await this.noteModel.create({
        title: title,
        content: content,
        userId: new mongoose.Types.ObjectId(userId),
      });

      return { data: note, message: 'Note successfully created 😍' };
    } catch (error) {
      this.logger.warn('Unable to create note, try again😉', error);
      throw new InternalServerErrorException(
        'Unable to create note, try again😉',
      );
    }
  }

  async updateNote(
    id: string,
    updateDto: UpdateNoteDto,
  ): Promise<{ data: NoteDocument; message: string }> {
    const { title, content } = updateDto;

    try {
      if (!mongoose.Types.ObjectId.isValid(id)) {
        throw new BadRequestException({ message: 'invalid / bad ID format' });
      }
      if (!title && !content) {
        throw new ImATeapotException(
          'haha, kindly tell us the title and the content😂😂',
        );
      }

      const updatedNote = await this.noteModel.findByIdAndUpdate(
        id,
        updateDto,
        {
          new: true,
          runValidators: true,
        },
      );

      if (!updatedNote) {
        throw new NotFoundException('Note not found or update failed');
      }

      return {
        message: 'Note successfully updated 😍',
        data: updatedNote as NoteDocument,
      };
    } catch (error) {
      this.logger.warn('Unable to update note, try again😉', error);
      throw new InternalServerErrorException(
        'Unable to update note, try again😉',
      );
    }
  }

  async getAllNotes(): Promise<{ data: NoteDocument[]; message: string }> {
    try {
      const note = await this.noteModel.find();
      return { data: note, message: 'Fetched all notes successfully 😍' };
    } catch (error) {
      this.logger.warn('Unable to create note, try again😉', error);
      throw new InternalServerErrorException(
        'Unable to create note, try again😉',
      );
    }
  }

  async getNoteById(
    id: string,
  ): Promise<{ data: NoteDocument; message: string }> {
    try {
      if (!mongoose.Types.ObjectId.isValid(id)) {
        throw new BadRequestException({ message: 'invalid / bad ID format' });
      }
      const note = await this.noteModel.findById(id);
      if (!note) {
        this.logger.warn({ message: ' User with this ID doesnt exist' });
        throw new NotFoundException('User Not found');
      }

      return { data: note, message: 'Fetched note successfully 😍' };
    } catch (error) {
      this.logger.warn('Unable to get your note, try again😉', error);
      throw new InternalServerErrorException(
        'Unable to get your note, try again😉',
      );
    }
  }

  async deleteNote(
    id: string,
  ): Promise<{ data: NoteDocument; message: string }> {
    try {
      if (!mongoose.Types.ObjectId.isValid(id)) {
        throw new BadRequestException({ message: 'invalid / bad ID format' });
      }
      const note = await this.noteModel.findByIdAndDelete(id);
      if (!note) {
        this.logger.warn({ message: ' User with this ID doesnt exist' });
        throw new NotFoundException('User Not found');
      }

      return { message: 'Note deleted successfully 😍', data: note };
    } catch (error) {
      this.logger.warn('Unable to delete your note, try again😉', error);
      throw new InternalServerErrorException(
        'Unable to delete your note, try again😉',
      );
    }
  }
}
