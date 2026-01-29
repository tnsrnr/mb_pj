import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { StudyRecord } from '../types';

interface StatisticsStore {
  studyRecords: StudyRecord[];
  studyStartTime: number | null; // 학습 시작 시간 (timestamp)

  // Actions
  startStudy: () => void;
  endStudy: (category: string, topicIds: string[]) => void;
  getDailyRecords: (days: number) => StudyRecord[];
  getMonthlyTotalTime: () => number; // 한달 총 학습 시간 (초)
  getCategoryProgress: () => { category: string; studied: number; total: number; completed: boolean }[];
  getCategoryDetails: (category: string) => { studied: string[]; notStudied: string[] };
  clearRecords: () => void;
}

export const useStatisticsStore = create<StatisticsStore>()(
  persist(
    (set, get) => ({
      studyRecords: [],
      studyStartTime: null,

      startStudy: () => {
        set({ studyStartTime: Date.now() });
      },

      endStudy: (categories: string[], topicIds: string[]) => {
        const { studyStartTime, studyRecords } = get();
        if (studyStartTime && categories.length > 0) {
          const studyTime = Math.floor((Date.now() - studyStartTime) / 1000); // 초 단위
          const today = new Date().toISOString().split('T')[0]; // YYYY-MM-DD

          // 동적 import로 순환 참조 방지
          const studyStore = require('./studyStore');
          const topics = studyStore.useStudyStore.getState().topics;

          let updatedRecords = [...studyRecords];

          // 각 카테고리별로 기록 저장
          categories.forEach((category) => {
            // 해당 카테고리의 토픽만 필터링 (여기서 id 대신 topic 문자열 비교)
            const categoryTopics = topicIds.filter((topicStr) => {
              const topic = topics.find((t: any) => t.topic === topicStr);
              return topic && topic.category_l1 === category;
            });

            if (categoryTopics.length === 0) return;

            // 오늘 날짜의 해당 카테고리 기록 찾기
            const existingRecordIndex = updatedRecords.findIndex(
              (record) => record.date === today && record.category === category
            );

            // 학습 시간을 카테고리별로 분배 (토픽 수에 비례)
            const categoryStudyTime = Math.floor(
              (studyTime * categoryTopics.length) / topicIds.length
            );

            if (existingRecordIndex >= 0) {
              // 기존 기록 업데이트
              const existing = updatedRecords[existingRecordIndex];
              const mergedTopicIds = Array.from(new Set([...existing.topicIds, ...categoryTopics]));
              updatedRecords[existingRecordIndex] = {
                ...existing,
                topicIds: mergedTopicIds,
                studyTime: existing.studyTime + categoryStudyTime,
              };
            } else {
              // 새 기록 추가
              updatedRecords.push({
                date: today,
                category,
                topicIds: categoryTopics,
                studyTime: categoryStudyTime,
              });
            }
          });

          set({ studyRecords: updatedRecords, studyStartTime: null });
        }
      },

      getDailyRecords: (days: number) => {
        const { studyRecords } = get();
        const cutoffDate = new Date();
        cutoffDate.setDate(cutoffDate.getDate() - days);
        const cutoffDateStr = cutoffDate.toISOString().split('T')[0];

        return studyRecords
          .filter((record) => record.date >= cutoffDateStr)
          .sort((a, b) => b.date.localeCompare(a.date));
      },

      getMonthlyTotalTime: () => {
        const { studyRecords } = get();
        const now = new Date();
        const firstDayOfMonth = new Date(now.getFullYear(), now.getMonth(), 1)
          .toISOString()
          .split('T')[0];

        return studyRecords
          .filter((record) => record.date >= firstDayOfMonth)
          .reduce((total, record) => total + record.studyTime, 0);
      },

      getCategoryProgress: () => {
        const { studyRecords } = get();
        // 동적 import로 순환 참조 방지
        const studyStore = require('./studyStore');
        const topics = studyStore.useStudyStore.getState().topics;

        // 모든 대분류 가져오기
        const allCategories = Array.from(new Set(topics.map((t: any) => t.category_l1)));

        return allCategories.map((category) => {
          // 해당 카테고리의 모든 토픽 문자열
          const categoryTopics = topics
            .filter((t: any) => t.category_l1 === category)
            .map((t: any) => t.topic);

          // 학습한 토픽 문자열 (모든 기록에서)
          const studiedTopics = new Set<string>();
          studyRecords.forEach((record) => {
            if (record.category === category) {
              record.topicIds.forEach((topicStr) => studiedTopics.add(topicStr));
            }
          });

          const studied = Array.from(studiedTopics).filter((topicStr) =>
            categoryTopics.includes(topicStr)
          ).length;

          return {
            category,
            studied,
            total: categoryTopics.length,
            completed: studied === categoryTopics.length && categoryTopics.length > 0,
          };
        });
      },

      getCategoryDetails: (category: string) => {
        const { studyRecords } = get();
        // 동적 import로 순환 참조 방지
        const studyStore = require('./studyStore');
        const topics = studyStore.useStudyStore.getState().topics;

        // 해당 카테고리의 모든 토픽 문자열
        const categoryTopics = topics
          .filter((t: any) => t.category_l1 === category)
          .map((t: any) => t.topic);

        // 학습한 토픽 문자열
        const studiedTopics = new Set<string>();
        studyRecords.forEach((record) => {
          if (record.category === category) {
            record.topicIds.forEach((topicStr) => studiedTopics.add(topicStr));
          }
        });

        const studied = Array.from(studiedTopics).filter((topicStr) =>
          categoryTopics.includes(topicStr)
        );
        const notStudied = categoryTopics.filter((topicStr) => !studiedTopics.has(topicStr));

        return { studied, notStudied };
      },

      clearRecords: () => {
        set({ studyRecords: [], studyStartTime: null });
      },
    }),
    {
      name: 'statistics-storage',
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);
