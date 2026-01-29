import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
} from 'react-native';
import { useRoute } from '@react-navigation/native';
import { useStatisticsStore } from '../store/statisticsStore';
import { useStudyStore } from '../store/studyStore';

export const CategoryDetailScreen: React.FC = () => {
  const route = useRoute();
  const category = (route.params as any)?.category || '';
  const { getCategoryDetails } = useStatisticsStore();
  const { topics } = useStudyStore();

  const { studied, notStudied } = getCategoryDetails(category);
  const categoryTopics = topics.filter((t) => t.category_l1 === category);

  const getTopicByStr = (topicStr: string) => {
    return categoryTopics.find((t) => t.topic === topicStr);
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>{category}</Text>
        <Text style={styles.headerSubtitle}>
          학습 완료: {studied.length} / {categoryTopics.length}
        </Text>
      </View>

      {/* 학습한 토픽 */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>학습한 토픽 ({studied.length})</Text>
        {studied.length === 0 ? (
          <Text style={styles.emptyText}>학습한 토픽이 없습니다.</Text>
        ) : (
          studied.map((topicStr) => {
            const topic = getTopicByStr(topicStr);
            return topic ? (
              <View key={topicStr} style={styles.topicItem}>
                <View style={styles.topicCheck}>
                  <Text style={styles.checkMark}>✓</Text>
                </View>
                <Text style={styles.topicText}>{topic.topic}</Text>
              </View>
            ) : null;
          })
        )}
      </View>

      {/* 학습하지 않은 토픽 */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>학습하지 않은 토픽 ({notStudied.length})</Text>
        {notStudied.length === 0 ? (
          <Text style={styles.emptyText}>모든 토픽을 학습했습니다!</Text>
        ) : (
          notStudied.map((topicStr) => {
            const topic = getTopicByStr(topicStr);
            return topic ? (
              <View key={topicStr} style={styles.topicItem}>
                <View style={[styles.topicCheck, styles.topicCheckEmpty]} />
                <Text style={[styles.topicText, styles.topicTextIncomplete]}>
                  {topic.topic}
                </Text>
              </View>
            ) : null;
          })
        )}
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F5F5',
  },
  content: {
    padding: 16,
  },
  header: {
    backgroundColor: '#fff',
    padding: 16,
    borderRadius: 12,
    marginBottom: 16,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 4,
  },
  headerSubtitle: {
    fontSize: 14,
    color: '#666',
  },
  section: {
    backgroundColor: '#fff',
    padding: 16,
    borderRadius: 12,
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 12,
  },
  topicItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  topicCheck: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#4CAF50',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  topicCheckEmpty: {
    backgroundColor: '#E0E0E0',
  },
  checkMark: {
    color: '#fff',
    fontSize: 14,
    fontWeight: 'bold',
  },
  topicText: {
    flex: 1,
    fontSize: 14,
    color: '#333',
  },
  topicTextIncomplete: {
    color: '#999',
  },
  emptyText: {
    fontSize: 14,
    color: '#999',
    fontStyle: 'italic',
    textAlign: 'center',
    padding: 20,
  },
});
