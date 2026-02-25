import React, { useEffect, useState, useRef, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
  Dimensions,
  type ViewStyle,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  runOnJS,
  Easing,
} from 'react-native-reanimated';
import { SwipeableCard, type SwipeableCardRef, type SwipeDirection } from '../components/SwipeableCard';
import { TopicCard } from '../components/TopicCard';
import { useStudyStore } from '../store/studyStore';
import { useStatisticsStore } from '../store/statisticsStore';
import { Ionicons } from '@expo/vector-icons';
import type { TopicData } from '../types';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const ENTER_DURATION = 260;
const ENTER_EASING = Easing.out(Easing.cubic);

type StudyPattern = 'full' | 'select_definition' | 'find_topic';

const IncomingCard: React.FC<{
  topic: TopicData;
  direction: SwipeDirection;
  studyPattern: StudyPattern;
  choiceCount: number;
  cardStyle: ViewStyle;
  onAnimationEnd: () => void;
}> = ({ topic, direction, studyPattern, choiceCount, cardStyle, onAnimationEnd }) => {
  const translateX = useSharedValue(direction === 'left' ? SCREEN_WIDTH : -SCREEN_WIDTH);
  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: Math.round(translateX.value) }],
  }));

  React.useEffect(() => {
    translateX.value = withTiming(
      0,
      {
        duration: ENTER_DURATION,
        easing: ENTER_EASING,
        isInteraction: false,
      },
      (finished) => {
        if (finished && onAnimationEnd) runOnJS(onAnimationEnd)();
      }
    );
  }, []);

  return (
    <View style={styles.incomingWrap} pointerEvents="none">
      <Animated.View style={[StyleSheet.absoluteFillObject, styles.incomingCard, cardStyle, animatedStyle]}>
        <TopicCard
          topic={topic}
          studyPattern={studyPattern}
          choiceCount={choiceCount}
          onAnswerSelected={() => {}}
        />
      </Animated.View>
    </View>
  );
};

export const StudyScreen: React.FC = () => {
  const navigation = useNavigation();
  const insets = useSafeAreaInsets();
  const swipeableRef = useRef<SwipeableCardRef>(null);
  const [transitioning, setTransitioning] = useState(false);
  const [incomingTopic, setIncomingTopic] = useState<TopicData | null>(null);
  const [transitionDir, setTransitionDir] = useState<SwipeDirection | null>(null);
  const exitDoneRef = useRef(false);
  const enterDoneRef = useRef(false);
  const transitionDirRef = useRef<SwipeDirection | null>(null);
  const transitionFinishedRef = useRef(false);

  const {
    filteredTopics,
    currentIndex,
    studyPattern,
    choiceCount,
    studiedTopics,
    isLoading,
    error,
    nextTopic,
    previousTopic,
    addStudiedTopic,
    resetStudiedTopics,
  } = useStudyStore();
  const { startStudy, endStudy } = useStatisticsStore();

  useEffect(() => {
    startStudy();
  }, []);

  const currentTopic = filteredTopics[currentIndex];
  const progress = filteredTopics.length > 0 
    ? ((currentIndex + 1) / filteredTopics.length) * 100 
    : 0;
  const isCompleted = currentIndex >= filteredTopics.length - 1 && filteredTopics.length > 0;

  useEffect(() => {
    if (isCompleted && filteredTopics.length > 0) {
      // 학습 기록 저장
      if (studiedTopics.length > 0) {
        const studiedTopicStrs = Array.from(new Set(studiedTopics));
        // 학습한 토픽들의 카테고리 목록 가져오기
        const studiedCategories = Array.from(
          new Set(
            filteredTopics
              .filter((topic) => studiedTopicStrs.includes(topic.topic))
              .map((topic) => topic.category_l1)
          )
        );
        if (studiedCategories.length > 0) {
          endStudy(studiedCategories, studiedTopicStrs);
        }
      }

      Alert.alert(
        '학습 완료!',
        `모든 토픽을 학습했습니다. (${filteredTopics.length}개)`,
        [
          {
            text: '다시 학습하기',
            onPress: () => {
              resetStudiedTopics();
            },
          },
          {
            text: '확인',
            style: 'cancel',
            onPress: () => {
              navigation.goBack();
            },
          },
        ]
      );
    }
  }, [isCompleted, filteredTopics.length, navigation, studiedTopics, endStudy, resetStudiedTopics]);

  const handleAnswerSelected = (isCorrect: boolean) => {
    if (currentTopic) {
      addStudiedTopic(currentTopic.topic);
    }
    
    // 정답이면 자동으로 다음으로 이동
    if (isCorrect && currentIndex < filteredTopics.length - 1) {
      setTimeout(() => {
        nextTopic();
      }, 1500);
    }
  };

  const finishTransition = useCallback(() => {
    if (transitionFinishedRef.current) return;
    transitionFinishedRef.current = true;

    const dir = transitionDirRef.current;
    if (dir === 'left') nextTopic();
    else if (dir === 'right') previousTopic();
    transitionDirRef.current = null;
    swipeableRef.current?.resetPosition();

    exitDoneRef.current = false;
    enterDoneRef.current = false;
    transitionFinishedRef.current = false;

    // 마지막 렌더 떨림 완화: unmount를 다음 프레임으로 미뤄 애니 종료와 리렌더 분리
    requestAnimationFrame(() => {
      setTransitioning(false);
      setIncomingTopic(null);
      setTransitionDir(null);
    });
  }, [nextTopic, previousTopic]);

  const handleExitAnimationEnd = useCallback(() => {
    exitDoneRef.current = true;
    if (enterDoneRef.current) finishTransition();
  }, [finishTransition]);

  const handleEnterAnimationEnd = useCallback(() => {
    enterDoneRef.current = true;
    if (exitDoneRef.current) finishTransition();
  }, [finishTransition]);

  const handleSwipeCommit = useCallback(
    (direction: SwipeDirection) => {
      if (direction === 'left' && currentIndex >= filteredTopics.length - 1) return;
      if (direction === 'right' && currentIndex <= 0) return;

      const nextIdx = direction === 'left' ? currentIndex + 1 : currentIndex - 1;
      const next = filteredTopics[nextIdx];
      if (!next) return;

      transitionDirRef.current = direction;
      setIncomingTopic(next);
      setTransitionDir(direction);
      setTransitioning(true);
    },
    [currentIndex, filteredTopics]
  );

  const handleSwipeLeft = () => {
    if (currentIndex < filteredTopics.length - 1) nextTopic();
  };

  const handleSwipeRight = () => {
    if (currentIndex > 0) previousTopic();
  };

  const handlePrevious = () => {
    previousTopic();
  };

  const handleNext = () => {
    // 전체학습 모드일 때는 선택지를 선택하지 않으므로 여기서 학습 완료 처리
    if (studyPattern === 'full' && currentTopic) {
      addStudiedTopic(currentTopic.topic);
    }
    
    if (currentIndex < filteredTopics.length - 1) {
      nextTopic();
    }
  };

  if (isLoading) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color="#2196F3" />
        <Text style={styles.loadingText}>토픽을 불러오는 중...</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.centerContainer}>
        <Text style={styles.errorText}>{error}</Text>
        <Text style={styles.errorSubText}>
          설정 화면에서 토픽을 새로고침해주세요.
        </Text>
      </View>
    );
  }

  if (filteredTopics.length === 0) {
    return (
      <View style={styles.centerContainer}>
        <Ionicons name="book-outline" size={64} color="#999" />
        <Text style={styles.emptyText}>학습할 토픽이 없습니다.</Text>
        <Text style={styles.emptySubText}>
          설정 화면에서 카테고리를 선택하고 토픽을 불러오세요.
        </Text>
      </View>
    );
  }

  if (!currentTopic) {
    return (
      <View style={styles.centerContainer}>
        <Text style={styles.emptyText}>토픽을 불러올 수 없습니다.</Text>
      </View>
    );
  }

  const bottomInset = Math.max(insets.bottom, 28);

  return (
    <View style={[styles.container, { paddingBottom: bottomInset }]}>
      {/* 진행도 표시 - 콤팩트 */}
      <View style={styles.progressContainer}>
        <View style={styles.progressBar}>
          <View
            style={[styles.progressFill, { width: `${progress}%` }]}
          />
        </View>
        <Text style={styles.progressText}>
          {currentIndex + 1}/{filteredTopics.length}
        </Text>
      </View>

      {/* 토픽 카드 - 왼쪽으로 나가고 오른쪽에서 신규 들어옴 */}
      <View style={styles.cardContainer} collapsable={false}>
        <SwipeableCard
          ref={swipeableRef}
          style={styles.swipeableCard}
          onSwipeCommit={handleSwipeCommit}
          onExitAnimationEnd={handleExitAnimationEnd}
          canSwipeLeft={currentIndex < filteredTopics.length - 1}
          canSwipeRight={currentIndex > 0}
        >
          <TopicCard
            topic={currentTopic}
            studyPattern={studyPattern}
            choiceCount={choiceCount}
            onAnswerSelected={handleAnswerSelected}
          />
        </SwipeableCard>

        {/* 들어오는 카드 오버레이 */}
        {transitioning && incomingTopic && transitionDir && (
          <IncomingCard
            topic={incomingTopic}
            direction={transitionDir}
            studyPattern={studyPattern}
            choiceCount={choiceCount}
            cardStyle={styles.swipeableCard}
            onAnimationEnd={handleEnterAnimationEnd}
          />
        )}
      </View>

      {/* 네비게이션 버튼 */}
      <View style={styles.navigationContainer}>
        <TouchableOpacity
          style={[
            styles.navButton,
            currentIndex === 0 && styles.navButtonDisabled,
          ]}
          onPress={handlePrevious}
          disabled={currentIndex === 0}
        >
          <Ionicons
            name="chevron-back"
            size={18}
            color={currentIndex === 0 ? '#999' : '#2196F3'}
          />
          <Text
            style={[
              styles.navButtonText,
              currentIndex === 0 && styles.navButtonTextDisabled,
            ]}
          >
            이전
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[
            styles.navButton,
            isCompleted && styles.navButtonDisabled,
          ]}
          onPress={handleNext}
          disabled={isCompleted}
        >
          <Text
            style={[
              styles.navButtonText,
              isCompleted && styles.navButtonTextDisabled,
            ]}
          >
            다음
          </Text>
          <Ionicons
            name="chevron-forward"
            size={14}
            color={isCompleted ? '#999' : '#2196F3'}
          />
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F5F5',
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
    backgroundColor: '#fff',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: '#666',
  },
  errorText: {
    fontSize: 18,
    color: '#F44336',
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 8,
  },
  errorSubText: {
    fontSize: 14,
    color: '#999',
    textAlign: 'center',
  },
  emptyText: {
    fontSize: 18,
    color: '#666',
    textAlign: 'center',
    marginTop: 16,
  },
  emptySubText: {
    fontSize: 14,
    color: '#999',
    textAlign: 'center',
    marginTop: 8,
  },
  progressContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingVertical: 6,
    paddingHorizontal: 10,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  progressBar: {
    flex: 1,
    height: 5,
    backgroundColor: '#E0E0E0',
    borderRadius: 2,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#2196F3',
    borderRadius: 2,
  },
  progressText: {
    fontSize: 12,
    color: '#666',
    minWidth: 32,
    textAlign: 'right',
  },
  cardContainer: {
    flex: 1,
    marginHorizontal: 6,
    marginVertical: 4,
    position: 'relative',
  },
  incomingWrap: {
    ...StyleSheet.absoluteFillObject,
  },
  incomingCard: {},
  swipeableCard: {
    flex: 1,
    borderRadius: 10,
    backgroundColor: '#fff',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 3,
    elevation: 2,
    overflow: 'hidden',
  },
  navigationContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 6,
    paddingHorizontal: 10,
    backgroundColor: '#fff',
    borderTopWidth: 1,
    borderTopColor: '#E0E0E0',
  },
  navButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
    backgroundColor: '#E3F2FD',
    gap: 4,
  },
  navButtonDisabled: {
    backgroundColor: '#F5F5F5',
  },
  navButtonText: {
    fontSize: 13,
    color: '#2196F3',
    fontWeight: '600',
  },
  navButtonTextDisabled: {
    color: '#999',
  },
});
