import React, { useState, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Modal,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useStatisticsStore } from '../store/statisticsStore';
import { useStudyStore } from '../store/studyStore';
import { Ionicons } from '@expo/vector-icons';

export const StatisticsScreen: React.FC = () => {
  const navigation = useNavigation();
  const { getDailyRecords, getMonthlyTotalTime, getCategoryProgress } =
    useStatisticsStore();
  const { topics } = useStudyStore();

  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [currentMonth, setCurrentMonth] = useState(new Date());

  const monthlyTotalTime = getMonthlyTotalTime();
  const categoryProgress = getCategoryProgress();

  const formatTime = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    if (hours > 0) {
      return `${hours}시간 ${minutes}분`;
    }
    return `${minutes}분`;
  };

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    const month = date.getMonth() + 1;
    const day = date.getDate();
    return `${month}/${day}`;
  };

  // 캘린더 생성
  const calendarDays = useMemo(() => {
    const year = currentMonth.getFullYear();
    const month = currentMonth.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startingDayOfWeek = firstDay.getDay();

    const days: Array<{ date: number; dateStr: string; hasRecord: boolean }> = [];

    // 빈 칸 추가 (첫 주 시작일 전)
    for (let i = 0; i < startingDayOfWeek; i++) {
      days.push({ date: 0, dateStr: '', hasRecord: false });
    }

    // 날짜 추가
    for (let date = 1; date <= daysInMonth; date++) {
      const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(date).padStart(2, '0')}`;
      const hasRecord = getDailyRecords(365).some((r) => r.date === dateStr);
      days.push({ date, dateStr, hasRecord });
    }

    return days;
  }, [currentMonth, getDailyRecords]);

  // 특정 날짜의 기록 가져오기
  const getDateRecords = (dateStr: string) => {
    return getDailyRecords(365).filter((r) => r.date === dateStr);
  };

  // 특정 날짜의 총 학습 시간
  const getDateTotalTime = (dateStr: string) => {
    const records = getDateRecords(dateStr);
    return records.reduce((total, record) => total + record.studyTime, 0);
  };

  // 특정 날짜의 완료된 대분류 수
  const getDateCompletedCategories = (dateStr: string) => {
    const records = getDateRecords(dateStr);
    const studiedCategories = new Set(records.map((r) => r.category));
    const allCategories = Array.from(new Set(topics.map((t) => t.category_l1)));

    let completed = 0;
    studiedCategories.forEach((category) => {
      const categoryTopics = topics.filter((t) => t.category_l1 === category);
      const studiedTopicStrs = new Set<string>();
      records.forEach((r) => {
        if (r.category === category) {
          r.topicIds.forEach((topicStr) => studiedTopicStrs.add(topicStr));
        }
      });
      const studiedCount = Array.from(studiedTopicStrs).filter((topicStr) =>
        categoryTopics.some((t) => t.topic === topicStr)
      ).length;
      if (studiedCount === categoryTopics.length && categoryTopics.length > 0) {
        completed++;
      }
    });

    return { completed, total: allCategories.length };
  };

  const changeMonth = (direction: number) => {
    setCurrentMonth(
      new Date(currentMonth.getFullYear(), currentMonth.getMonth() + direction, 1)
    );
  };

  const monthNames = [
    '1월',
    '2월',
    '3월',
    '4월',
    '5월',
    '6월',
    '7월',
    '8월',
    '9월',
    '10월',
    '11월',
    '12월',
  ];

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      {/* 한달 총 학습 시간 */}
      <View style={styles.summaryCard}>
        <Text style={styles.summaryTitle}>이번 달 총 학습 시간</Text>
        <Text style={styles.summaryValue}>{formatTime(monthlyTotalTime)}</Text>
      </View>

      {/* 캘린더 */}
      <View style={styles.calendarCard}>
        <View style={styles.calendarHeader}>
          <TouchableOpacity onPress={() => changeMonth(-1)}>
            <Ionicons name="chevron-back" size={24} color="#2196F3" />
          </TouchableOpacity>
          <Text style={styles.calendarMonth}>
            {currentMonth.getFullYear()}년 {monthNames[currentMonth.getMonth()]}
          </Text>
          <TouchableOpacity onPress={() => changeMonth(1)}>
            <Ionicons name="chevron-forward" size={24} color="#2196F3" />
          </TouchableOpacity>
        </View>

        {/* 요일 헤더 */}
        <View style={styles.weekDays}>
          {['일', '월', '화', '수', '목', '금', '토'].map((day) => (
            <Text key={day} style={styles.weekDay}>
              {day}
            </Text>
          ))}
        </View>

        {/* 캘린더 그리드 */}
        <View style={styles.calendarGrid}>
          {calendarDays.map((day, index) => {
            if (day.date === 0) {
              return <View key={index} style={styles.calendarDay} />;
            }

            const totalTime = getDateTotalTime(day.dateStr);
            const { completed, total } = getDateCompletedCategories(day.dateStr);
            const hasRecord = day.hasRecord;

            return (
              <TouchableOpacity
                key={index}
                style={[styles.calendarDay, hasRecord && styles.calendarDayHasRecord]}
                onPress={() => setSelectedDate(day.dateStr)}
              >
                <Text style={styles.calendarDayNumber}>{day.date}</Text>
                {hasRecord && (
                  <View style={styles.calendarDayInfo}>
                    <Text style={styles.calendarDayTime}>
                      {totalTime > 0 ? formatTime(totalTime) : ''}
                    </Text>
                    <Text style={styles.calendarDayCategories}>
                      {completed}/{total}
                    </Text>
                  </View>
                )}
              </TouchableOpacity>
            );
          })}
        </View>
      </View>

      {/* 상세 내역 모달 */}
      <Modal
        visible={selectedDate !== null}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setSelectedDate(null)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>
                {selectedDate && formatDate(selectedDate)} 상세 내역
              </Text>
              <TouchableOpacity onPress={() => setSelectedDate(null)}>
                <Ionicons name="close" size={24} color="#666" />
              </TouchableOpacity>
            </View>

            {selectedDate && (
              <ScrollView style={styles.modalBody}>
                {getDateRecords(selectedDate).length === 0 ? (
                  <Text style={styles.emptyText}>학습 기록이 없습니다.</Text>
                ) : (
                  <>
                    <View style={styles.modalSummary}>
                      <Text style={styles.modalSummaryText}>
                        총 학습 시간: {formatTime(getDateTotalTime(selectedDate))}
                      </Text>
                      <Text style={styles.modalSummaryText}>
                        완료된 대분류: {getDateCompletedCategories(selectedDate).completed} /{' '}
                        {getDateCompletedCategories(selectedDate).total}
                      </Text>
                    </View>

                    {getDateRecords(selectedDate).map((record, index) => (
                      <View key={index} style={styles.recordCard}>
                        <Text style={styles.recordCategory}>{record.category}</Text>
                        <Text style={styles.recordInfo}>
                          {record.topicIds.length}개 토픽 · {formatTime(record.studyTime)}
                        </Text>
                      </View>
                    ))}
                  </>
                )}
              </ScrollView>
            )}
          </View>
        </View>
      </Modal>
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
  summaryCard: {
    backgroundColor: '#fff',
    padding: 16,
    borderRadius: 12,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  summaryTitle: {
    fontSize: 14,
    color: '#666',
    marginBottom: 8,
  },
  summaryValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#2196F3',
  },
  calendarCard: {
    backgroundColor: '#fff',
    padding: 12,
    borderRadius: 12,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  calendarHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
    paddingHorizontal: 8,
  },
  calendarMonth: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  weekDays: {
    flexDirection: 'row',
    marginBottom: 8,
  },
  weekDay: {
    flex: 1,
    textAlign: 'center',
    fontSize: 12,
    fontWeight: '600',
    color: '#666',
  },
  calendarGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  calendarDay: {
    width: '14.28%',
    aspectRatio: 1,
    padding: 4,
    borderWidth: 1,
    borderColor: '#F0F0F0',
    justifyContent: 'flex-start',
    alignItems: 'center',
  },
  calendarDayHasRecord: {
    backgroundColor: '#E3F2FD',
    borderColor: '#2196F3',
  },
  calendarDayNumber: {
    fontSize: 12,
    fontWeight: '600',
    color: '#333',
    marginBottom: 2,
  },
  calendarDayInfo: {
    alignItems: 'center',
    width: '100%',
  },
  calendarDayTime: {
    fontSize: 8,
    color: '#2196F3',
    fontWeight: '600',
  },
  calendarDayCategories: {
    fontSize: 8,
    color: '#666',
    marginTop: 2,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: '80%',
    paddingTop: 20,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  modalBody: {
    padding: 20,
  },
  modalSummary: {
    backgroundColor: '#F5F5F5',
    padding: 12,
    borderRadius: 8,
    marginBottom: 16,
  },
  modalSummaryText: {
    fontSize: 14,
    color: '#666',
    marginBottom: 4,
  },
  recordCard: {
    backgroundColor: '#F9F9F9',
    padding: 12,
    borderRadius: 8,
    marginBottom: 8,
  },
  recordCategory: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 4,
  },
  recordInfo: {
    fontSize: 12,
    color: '#666',
  },
  emptyText: {
    fontSize: 14,
    color: '#999',
    textAlign: 'center',
    padding: 20,
  },
});
