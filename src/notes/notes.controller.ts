import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Put,
  Post,
} from '@nestjs/common';
import { UpdateNoteDto } from './note-dto/update-note.dto';
import { CreateNoteDto } from './note-dto/create-note.dto';
import { NotesService } from './notes.service';

@Controller('notes')
export class NotesController {
  constructor(private readonly notesService: NotesService) {}

  @Get()
  getAllNotes() {
    return this.notesService.getAllNotes();
  }

  @Post('create')
  createNote(@Body() createNoteDto: CreateNoteDto) {
    return this.notesService.createNote(createNoteDto);
  }

  @Get(':id')
  getNoteById(@Param('id') id: string) {
    return this.notesService.getNoteById(id);
  }

  @Put(':id')
  updateNote(@Param('id') id: string, @Body() updateNoteDto: UpdateNoteDto) {
    return this.notesService.updateNote(id, updateNoteDto);
  }

  @Delete(':id')
  deleteNote(@Param('id') id: string) {
    return this.notesService.deleteNote(id);
  }
}
