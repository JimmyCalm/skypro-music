import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { TrackType } from '@/sharedTypes/types';

type initialStateType = {
  currentTrack: TrackType | null;
  currentPlaylist: TrackType[];
  currentTrackIndex: number;
  isPlaying: boolean;
  isShuffled: boolean;
  isLoop: boolean;
  shuffledPlaylist: TrackType[];
  volume: number;
  currentTime: number;
  duration: number;
};

const initialState: initialStateType = {
  currentTrack: null,
  currentPlaylist: [],
  currentTrackIndex: -1,
  isPlaying: false,
  isShuffled: false,
  isLoop: false,
  shuffledPlaylist: [],
  volume: 0.5,
  currentTime: 0,
  duration: 0,
};

const trackSlice = createSlice({
  name: 'track',
  initialState,
  reducers: {
    setCurrentTrack: (state, action: PayloadAction<TrackType>) => {
      state.currentTrack = action.payload;
    },
    setCurrentPlaylist: (state, action: PayloadAction<TrackType[]>) => {
      state.currentPlaylist = action.payload;
      state.currentTrackIndex = action.payload.findIndex(
        (track) => track._id === state.currentTrack?._id,
      );
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
    toggleShuffle: (state) => {
      state.isShuffled = !state.isShuffled;
      if (state.isShuffled && state.currentPlaylist.length > 0) {
        // Создаем перемешанный плейлист
        const shuffled = [...state.currentPlaylist]
          .filter((track) => track._id !== state.currentTrack?._id)
          .sort(() => Math.random() - 0.5);
        state.shuffledPlaylist = [state.currentTrack!, ...shuffled];
      }
    },
    toggleLoop: (state) => {
      state.isLoop = !state.isLoop;
    },
    setVolume: (state, action: PayloadAction<number>) => {
      state.volume = action.payload;
    },
    setCurrentTime: (state, action: PayloadAction<number>) => {
      state.currentTime = action.payload;
    },
    setDuration: (state, action: PayloadAction<number>) => {
      state.duration = action.payload;
    },
    nextTrack: (state) => {
      if (state.currentPlaylist.length === 0) return;

      let nextIndex;
      if (state.isShuffled && state.shuffledPlaylist.length > 0) {
        const currentIndex = state.shuffledPlaylist.findIndex(
          (track) => track._id === state.currentTrack?._id,
        );
        nextIndex =
          currentIndex < state.shuffledPlaylist.length - 1
            ? currentIndex + 1
            : -1;
        if (nextIndex !== -1) {
          state.currentTrack = state.shuffledPlaylist[nextIndex];
          state.isPlaying = true;
        }
      } else {
        nextIndex =
          state.currentTrackIndex < state.currentPlaylist.length - 1
            ? state.currentTrackIndex + 1
            : -1;
        if (nextIndex !== -1) {
          state.currentTrack = state.currentPlaylist[nextIndex];
          state.currentTrackIndex = nextIndex;
          state.isPlaying = true;
        }
      }
    },
    prevTrack: (state) => {
      if (state.currentPlaylist.length === 0) return;

      let prevIndex;
      if (state.isShuffled && state.shuffledPlaylist.length > 0) {
        const currentIndex = state.shuffledPlaylist.findIndex(
          (track) => track._id === state.currentTrack?._id,
        );
        prevIndex = currentIndex > 0 ? currentIndex - 1 : -1;
        if (prevIndex !== -1) {
          state.currentTrack = state.shuffledPlaylist[prevIndex];
          state.isPlaying = true;
        }
      } else {
        prevIndex =
          state.currentTrackIndex > 0 ? state.currentTrackIndex - 1 : -1;
        if (prevIndex !== -1) {
          state.currentTrack = state.currentPlaylist[prevIndex];
          state.currentTrackIndex = prevIndex;
          state.isPlaying = true;
        }
      }
    },
  },
});

export const {
  setCurrentTrack,
  setIsPlaying,
  playTrack,
  togglePlay,
  toggleShuffle,
  toggleLoop,
  setVolume,
  setCurrentTime,
  setDuration,
  nextTrack,
  prevTrack,
  setCurrentPlaylist,
} = trackSlice.actions;

export const trackSliceReducer = trackSlice.reducer;
