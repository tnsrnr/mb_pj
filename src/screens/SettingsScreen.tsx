import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useStudyStore } from '../store/studyStore';
import { fetchTopics } from '../services/api';
import { StudyMode, StudyPattern } from '../types';

export const SettingsScreen: React.FC = () => {
  const navigation = useNavigation();
  const {
    topics,
    filteredTopics,
    studyMode,
    studyPattern,
    selectedCategories,
    selectedImportances,
    choiceCount,
    setStudyMode,
    setStudyPattern,
    setSelectedCategories,
    setSelectedImportances,
    setChoiceCount,
    setTopics,
    setLoading,
    setError,
    filterTopics,
  } = useStudyStore();

  const [availableCategories, setAvailableCategories] = useState<string[]>([]);
  const [isLoadingData, setIsLoadingData] = useState(false);

  useEffect(() => {
    loadTopics();
  }, []);

  useEffect(() => {
    if (topics.length > 0) {
      const categories = Array.from(
        new Set(topics.map((topic) => topic.category_l1))
      ).sort();
      setAvailableCategories(categories);
    }
  }, [topics]);

  const loadTopics = async () => {
    setIsLoadingData(true);
    setLoading(true);
    setError(null);
    try {
      const data = await fetchTopics();
      setTopics(data);
      filterTopics();
    } catch (error) {
      setError('토픽을 불러오는데 실패했습니다.');
      console.error('Failed to load topics:', error);
    } finally {
      setIsLoadingData(false);
      setLoading(false);
    }
  };

  const toggleCategory = (category: string) => {
    const newCategories = selectedCategories.includes(category)
      ? selectedCategories.filter((c) => c !== category)
      : [...selectedCategories, category];
    setSelectedCategories(newCategories);
  };

  const toggleAllCategories = () => {
    if (selectedCategories.length === availableCategories.length) {
      setSelectedCategories([]);
    } else {
      setSelectedCategories([...availableCategories]);
    }
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>학습 방식</Text>
        <View style={styles.optionsContainer}>
          {(['full', 'select_definition', 'find_topic'] as StudyPattern[]).map(
            (pattern) => (
              <TouchableOpacity
                key={pattern}
                style={[
                  styles.optionButton,
                  studyPattern === pattern && styles.optionButtonSelected,
                ]}
                onPress={() => setStudyPattern(pattern)}
              >
                <Text
                  style={[
                    styles.optionText,
                    studyPattern === pattern && styles.optionTextSelected,
                  ]}
                >
                  {pattern === 'full'
                    ? '전체 학습'
                    : pattern === 'select_definition'
                    ? '정의 선택'
                    : '토픽 선택'}
                </Text>
              </TouchableOpacity>
            )
          )}
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>학습 모드</Text>
        <View style={styles.optionsContainer}>
          {(['sequential', 'random'] as StudyMode[]).map((mode) => (
            <TouchableOpacity
              key={mode}
              style={[
                styles.optionButton,
                studyMode === mode && styles.optionButtonSelected,
              ]}
              onPress={() => setStudyMode(mode)}
            >
              <Text
                style={[
                  styles.optionText,
                  studyMode === mode && styles.optionTextSelected,
                ]}
              >
                {mode === 'random' ? '랜덤' : '순차'}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>중요도</Text>
        <View style={styles.optionsContainer}>
          {(['대', '중', '소'] as string[]).map((importance) => (
            <TouchableOpacity
              key={importance}
              style={[
                styles.optionButton,
                selectedImportances.includes(importance) && styles.optionButtonSelected,
              ]}
              onPress={() => {
                const newImportances = selectedImportances.includes(importance)
                  ? selectedImportances.filter((i) => i !== importance)
                  : [...selectedImportances, importance];
                setSelectedImportances(newImportances);
              }}
            >
              <Text
                style={[
                  styles.optionText,
                  selectedImportances.includes(importance) && styles.optionTextSelected,
                ]}
              >
                {importance}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>선택지 개수</Text>
        <View style={styles.counterContainer}>
          <TouchableOpacity
            style={styles.counterButton}
            onPress={() => setChoiceCount(Math.max(2, choiceCount - 1))}
          >
            <Text style={styles.counterButtonText}>-</Text>
          </TouchableOpacity>
          <Text style={styles.counterValue}>{choiceCount}</Text>
          <TouchableOpacity
            style={styles.counterButton}
            onPress={() => setChoiceCount(Math.min(10, choiceCount + 1))}
          >
            <Text style={styles.counterButtonText}>+</Text>
          </TouchableOpacity>
        </View>
      </View>

      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>대분류 선택</Text>
          <TouchableOpacity onPress={toggleAllCategories}>
            <Text style={styles.toggleAllText}>
              {selectedCategories.length === availableCategories.length
                ? '전체 해제'
                : '전체 선택'}
            </Text>
          </TouchableOpacity>
        </View>
        <View style={styles.categoriesContainer}>
          {availableCategories.map((category) => (
            <TouchableOpacity
              key={category}
              style={[
                styles.categoryChip,
                selectedCategories.includes(category) &&
                  styles.categoryChipSelected,
              ]}
              onPress={() => toggleCategory(category)}
            >
              <Text
                style={[
                  styles.categoryChipText,
                  selectedCategories.includes(category) &&
                    styles.categoryChipTextSelected,
                ]}
              >
                {category}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
        {availableCategories.length === 0 && (
          <Text style={styles.emptyText}>
            토픽을 불러온 후 카테고리를 선택할 수 있습니다.
          </Text>
        )}
      </View>

      <View style={styles.section}>
        <TouchableOpacity
          style={[styles.button, isLoadingData && styles.buttonDisabled]}
          onPress={async () => {
            await loadTopics();
            // 필터링된 토픽이 있으면 학습 화면으로 이동
            const { filteredTopics: currentFilteredTopics } = useStudyStore.getState();
            if (currentFilteredTopics.length > 0) {
              navigation.navigate('Study' as never);
            }
          }}
          disabled={isLoadingData}
        >
          <Text style={styles.buttonText}>
            {isLoadingData ? '불러오는 중...' : '학습시작'}
          </Text>
        </TouchableOpacity>
        <Text style={styles.topicCountText}>
          선택된 토픽: {selectedCategories.length > 0 ? filteredTopics.length : 0}/{topics.length}
        </Text>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  content: {
    padding: 16,
  },
  section: {
    marginBottom: 20,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 8,
  },
  optionsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  optionButton: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 8,
    borderWidth: 2,
    borderColor: '#E0E0E0',
    backgroundColor: '#fff',
    minWidth: 80,
  },
  optionButtonSelected: {
    borderColor: '#2196F3',
    backgroundColor: '#E3F2FD',
  },
  optionText: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
  },
  optionTextSelected: {
    color: '#2196F3',
    fontWeight: 'bold',
  },
  counterContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 16,
  },
  counterButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#2196F3',
    justifyContent: 'center',
    alignItems: 'center',
  },
  counterButtonText: {
    fontSize: 20,
    color: '#fff',
    fontWeight: 'bold',
  },
  counterValue: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    minWidth: 32,
    textAlign: 'center',
  },
  categoriesContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  categoryChip: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#E0E0E0',
    backgroundColor: '#fff',
  },
  categoryChipSelected: {
    borderColor: '#2196F3',
    backgroundColor: '#E3F2FD',
  },
  categoryChipText: {
    fontSize: 12,
    color: '#666',
  },
  categoryChipTextSelected: {
    color: '#2196F3',
    fontWeight: 'bold',
  },
  toggleAllText: {
    fontSize: 12,
    color: '#2196F3',
    fontWeight: '600',
  },
  emptyText: {
    fontSize: 12,
    color: '#999',
    fontStyle: 'italic',
  },
  button: {
    padding: 14,
    borderRadius: 8,
    backgroundColor: '#2196F3',
    alignItems: 'center',
  },
  buttonDisabled: {
    backgroundColor: '#BBDEFB',
  },
  buttonText: {
    fontSize: 15,
    color: '#fff',
    fontWeight: 'bold',
  },
  topicCountText: {
    fontSize: 13,
    color: '#666',
    textAlign: 'center',
    marginTop: 10,
  },
  infoSection: {
    marginTop: 20,
    padding: 16,
    backgroundColor: '#F5F5F5',
    borderRadius: 8,
  },
  infoText: {
    fontSize: 14,
    color: '#666',
    marginBottom: 4,
  },
});
