import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { TrackType } from '@/sharedTypes/types';

type initialStateType = {
  currentTrack: TrackType | null;
  isPlaying: boolean;
};

const initialState: initialStateType = {
  currentTrack: null,
  isPlaying: false,
};

const trackSlice = createSlice({
  name: 'track',
  initialState,
  reducers: {
    setCurrentTrack: (state, action: PayloadAction<TrackType>) => {
      state.currentTrack = action.payload;
    },
    setIsPlaying: (state, action: PayloadAction<boolean>) => {
      state.isPlaying = action.payload;
    },
    playTrack: (state, action: PayloadAction<TrackType>) => {
      state.currentTrack = action.payload;
      state.isPlaying = true;
    },
    togglePlay: (state) => {
      state.isPlaying = !state.isPlaying;
    },
  },
});

export const { setCurrentTrack, setIsPlaying, playTrack, togglePlay } =
  trackSlice.actions;
export const trackSliceReducer = trackSlice.reducer;
