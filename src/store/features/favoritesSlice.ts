import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { TrackType } from '@/sharedTypes/types';
import { getFavoriteTracks, isApiError } from '@/api';

type FavoritesState = {
  tracks: TrackType[];
  loading: boolean;
  error: string | null;
};

const initialState: FavoritesState = {
  tracks: [],
  loading: false,
  error: null,
};

// Функция для получения избранных треков из localStorage (для fallback)
const getLikedTracksFromStorage = (): number[] => {
  if (typeof window === 'undefined') return [];
  return JSON.parse(localStorage.getItem('likedTracks') || '[]');
};

export const loadFavorites = createAsyncThunk(
  'favorites/loadFavorites',
  async () => {
    try {
      const result = await getFavoriteTracks();

      if (isApiError(result)) {
        return [];
      }

      return result as TrackType[];
    } catch (error) {
      console.error('Error loading favorites:', error);
      return [];
    }
  },
);

export const addToFavoritesRedux = createAsyncThunk(
  'favorites/addToFavorites',
  async (track: TrackType, { dispatch }) => {
    // Сохраняем в localStorage
    if (typeof window !== 'undefined') {
      const likedTracks = JSON.parse(
        localStorage.getItem('likedTracks') || '[]',
      );
      if (!likedTracks.includes(track._id)) {
        likedTracks.push(track._id);
        localStorage.setItem('likedTracks', JSON.stringify(likedTracks));
      }
    }

    // Обновляем состояние немедленно
    dispatch(addTrackToFavorites(track));

    return track;
  },
);

export const removeFromFavoritesRedux = createAsyncThunk(
  'favorites/removeFromFavorites',
  async (trackId: number, { dispatch }) => {
    // Удаляем из localStorage
    if (typeof window !== 'undefined') {
      const likedTracks = JSON.parse(
        localStorage.getItem('likedTracks') || '[]',
      );
      const updatedTracks = likedTracks.filter((id: number) => id !== trackId);
      localStorage.setItem('likedTracks', JSON.stringify(updatedTracks));
    }

    // Обновляем состояние немедленно
    dispatch(removeTrackFromFavorites(trackId));

    return trackId;
  },
);

const favoritesSlice = createSlice({
  name: 'favorites',
  initialState,
  reducers: {
    clearFavorites: (state) => {
      state.tracks = [];
      if (typeof window !== 'undefined') {
        localStorage.removeItem('likedTracks');
      }
    },
    addTrackToFavorites: (state, action: PayloadAction<TrackType>) => {
      const trackExists = state.tracks.some(
        (t) => t._id === action.payload._id,
      );
      if (!trackExists) {
        state.tracks.push(action.payload);
      }
    },
    removeTrackFromFavorites: (state, action: PayloadAction<number>) => {
      state.tracks = state.tracks.filter(
        (track) => track._id !== action.payload,
      );
    },
    syncFavoritesFromStorage: (state, action: PayloadAction<TrackType[]>) => {
      state.tracks = action.payload;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(loadFavorites.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(
        loadFavorites.fulfilled,
        (state, action: PayloadAction<TrackType[]>) => {
          state.loading = false;
          state.tracks = action.payload;
        },
      )
      .addCase(loadFavorites.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });
  },
});

export const {
  clearFavorites,
  addTrackToFavorites,
  removeTrackFromFavorites,
  syncFavoritesFromStorage,
} = favoritesSlice.actions;
export const favoritesReducer = favoritesSlice.reducer;
