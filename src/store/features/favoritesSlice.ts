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

export const loadFavorites = createAsyncThunk(
  'favorites/loadFavorites',
  async () => {
    try {
      const result = await getFavoriteTracks();

      if (isApiError(result)) {
        console.warn('ошибка при загрузке избранного:', result.message);
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
  async (track: TrackType) => {
    // Сохраняем в localStorage для демо
    if (typeof window !== 'undefined') {
      const likedTracks = JSON.parse(
        localStorage.getItem('likedTracks') || '[]',
      ) as number[];
      if (!likedTracks.includes(track._id)) {
        likedTracks.push(track._id);
        localStorage.setItem('likedTracks', JSON.stringify(likedTracks));
      }
    }

    return track;
  },
);

export const removeFromFavoritesRedux = createAsyncThunk(
  'favorites/removeFromFavorites',
  async (trackId: number) => {
    // Удаляем из localStorage для демо
    if (typeof window !== 'undefined') {
      const likedTracks = JSON.parse(
        localStorage.getItem('likedTracks') || '[]',
      ) as number[];
      const updatedTracks = likedTracks.filter((id: number) => id !== trackId);
      localStorage.setItem('likedTracks', JSON.stringify(updatedTracks));
    }

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
          state.error = null;
        },
      )
      .addCase(loadFavorites.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Ошибка загрузки избранного';
      })
      .addCase(
        addToFavoritesRedux.fulfilled,
        (state, action: PayloadAction<TrackType>) => {
          const trackExists = state.tracks.some(
            (t) => t._id === action.payload._id,
          );
          if (!trackExists) {
            state.tracks.push(action.payload);
          }
        },
      )
      .addCase(
        removeFromFavoritesRedux.fulfilled,
        (state, action: PayloadAction<number>) => {
          state.tracks = state.tracks.filter(
            (track) => track._id !== action.payload,
          );
        },
      );
  },
});

export const { clearFavorites, addTrackToFavorites, removeTrackFromFavorites } =
  favoritesSlice.actions;
export const favoritesReducer = favoritesSlice.reducer;
