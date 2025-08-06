import { Body, Controller, Delete, Get, Param, Put } from '@nestjs/common';
import { UpdateNoteDto } from './note-dto/update-note.dto';
import { NotesService } from './notes.service';

@Controller('notes')
export class NotesController {
  constructor(private readonly notesService: NotesService) {}

  @Get()
  getAllNotes() {
    return this.notesService.getAllNotes();
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
