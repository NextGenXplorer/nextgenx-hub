import { useBookmarks as useBookmarksContext } from '../context/BookmarkContext';

export const useBookmarks = () => {
    return useBookmarksContext();
};
