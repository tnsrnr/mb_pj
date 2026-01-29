import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { TopicData, StudyMode, StudyPattern } from '../types';
import {
  DEFAULT_CHOICE_COUNT,
  DEFAULT_STUDY_MODE,
  DEFAULT_STUDY_PATTERN,
} from '../utils/constants';

interface StudyStore {
  topics: TopicData[];
  currentIndex: number;
  studyMode: StudyMode;
  studyPattern: StudyPattern;
  selectedCategories: string[];
  selectedImportances: string[];
  choiceCount: number;
  studiedTopics: string[];
  filteredTopics: TopicData[];
  isLoading: boolean;
  error: string | null;

  // Actions
  setTopics: (topics: TopicData[]) => void;
  setCurrentIndex: (index: number) => void;
  setStudyMode: (mode: StudyMode) => void;
  setStudyPattern: (pattern: StudyPattern) => void;
  setSelectedCategories: (categories: string[]) => void;
  setSelectedImportances: (importances: string[]) => void;
  setChoiceCount: (count: number) => void;
  addStudiedTopic: (topic: string) => void;
  resetStudiedTopics: () => void;
  filterTopics: () => void;
  nextTopic: () => void;
  previousTopic: () => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  reset: () => void;
}

const initialState = {
  topics: [],
  currentIndex: 0,
  studyMode: DEFAULT_STUDY_MODE,
  studyPattern: DEFAULT_STUDY_PATTERN,
  selectedCategories: [],
  selectedImportances: ['대', '중', '소'],
  choiceCount: DEFAULT_CHOICE_COUNT,
  studiedTopics: [],
  filteredTopics: [],
  isLoading: false,
  error: null,
};

export const useStudyStore = create<StudyStore>()(
  persist(
    (set, get) => ({
      ...initialState,

      setTopics: (topics) => {
        set({ topics });
        get().filterTopics();
      },

      setCurrentIndex: (index) => {
        const { filteredTopics } = get();
        if (index >= 0 && index < filteredTopics.length) {
          set({ currentIndex: index });
        }
      },

      setStudyMode: (mode) => {
        set({ studyMode: mode });
        get().filterTopics();
      },

      setStudyPattern: (pattern) => {
        set({ studyPattern: pattern });
      },

      setSelectedCategories: (categories) => {
        set({ selectedCategories: categories });
        get().filterTopics();
      },

      setSelectedImportances: (importances) => {
        set({ selectedImportances: importances });
        get().filterTopics();
      },

      setChoiceCount: (count) => {
        set({ choiceCount: Math.max(2, Math.min(10, count)) });
      },

      addStudiedTopic: (topic) => {
        const { studiedTopics } = get();
        if (!studiedTopics.includes(topic)) {
          set({ studiedTopics: [...studiedTopics, topic] });
        }
      },

      resetStudiedTopics: () => {
        set({ studiedTopics: [], currentIndex: 0 });
        get().filterTopics();
      },

      filterTopics: () => {
        const { topics, selectedCategories, selectedImportances, studyMode } = get();
        let filtered = [...topics];

        // 카테고리 필터링
        if (selectedCategories.length > 0) {
          filtered = filtered.filter((topic) =>
            selectedCategories.includes(topic.category_l1)
          );
        }

        // 중요도 필터링
        if (selectedImportances.length > 0) {
          filtered = filtered.filter((topic) =>
            selectedImportances.includes(topic.importance)
          );
        }

        // 학습 모드에 따라 정렬
        if (studyMode === 'random') {
          filtered = filtered.sort(() => Math.random() - 0.5);
        }

        set({ filteredTopics: filtered, currentIndex: 0 });
      },

      nextTopic: () => {
        const { currentIndex, filteredTopics } = get();
        if (currentIndex < filteredTopics.length - 1) {
          set({ currentIndex: currentIndex + 1 });
        }
      },

      previousTopic: () => {
        const { currentIndex } = get();
        if (currentIndex > 0) {
          set({ currentIndex: currentIndex - 1 });
        }
      },

      setLoading: (loading) => set({ isLoading: loading }),

      setError: (error) => set({ error }),

      reset: () => {
        set(initialState);
      },
    }),
    {
      name: 'study-storage',
      storage: createJSONStorage(() => AsyncStorage),
      partialize: (state) => ({
        studyMode: state.studyMode,
        studyPattern: state.studyPattern,
        selectedCategories: state.selectedCategories,
        selectedImportances: state.selectedImportances,
        choiceCount: state.choiceCount,
        studiedTopics: state.studiedTopics,
      }),
    }
  )
);
