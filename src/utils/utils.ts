import { CACHE_PREFIX_NOTES } from '../notes/notes.constant';
import { CACHE_PREFIX_USERS } from '../notes/notes.constant';
export const generateNoteKey = (id: string) => {
  return `${CACHE_PREFIX_NOTES}:${id}`;
};
export const generateUserKey = (id: string) => {
  return `${CACHE_PREFIX_USERS}:${id}`;
};
