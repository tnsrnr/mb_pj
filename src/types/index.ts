export interface TopicData {
  topic: string;
  topics_eng?: string;
  topics_loc?: string;
  importance: string;
  category_l1: string;
  category_l2?: string;
  definition?: string;
  cheatsheet?: string;
  additional_info?: string;
  viewtable?: string;
}

export type StudyMode = 'random' | 'sequential';
export type StudyPattern = 'full' | 'select_definition' | 'find_topic';

export interface StudySettings {
  studyMode: StudyMode;
  studyPattern: StudyPattern;
  selectedCategories: string[];
  choiceCount: number;
}

export interface StudyRecord {
  date: string; // YYYY-MM-DD 형식
  category: string; // 대분류
  topicIds: string[]; // 학습한 토픽 목록 (topic 문자열)
  studyTime: number; // 학습 시간 (초)
}