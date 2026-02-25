import React, { useMemo } from 'react';
import { View, Text, StyleSheet, useWindowDimensions } from 'react-native';
import { ScrollView as GHScrollView, NativeViewGestureHandler } from 'react-native-gesture-handler';
import WebView from 'react-native-webview';
import { TopicData, StudyPattern } from '../types';
import { ChoiceButton } from './ChoiceButton';
import { useStudyStore } from '../store/studyStore';

const VIEWTABLE_SCROLL_WIDTH = 10000;

/** 추가정보만 웹처럼 표시: WebView로 HTML 렌더링 (표·스타일 동일), 높이 콘텐츠에 맞춤 */
const ADDITIONAL_INFO_WEBVIEW_MIN_HEIGHT = 120;

const INJECT_HEIGHT_SCRIPT = `
  (function sendSize() {
    var wrap = document.querySelector('.wrap');
    var h = wrap ? wrap.scrollHeight : Math.max(document.body.scrollHeight, document.documentElement.scrollHeight);
    var w = wrap ? wrap.scrollWidth : Math.max(document.body.scrollWidth, document.documentElement.scrollWidth);
    if (window.ReactNativeWebView) {
      window.ReactNativeWebView.postMessage(JSON.stringify({
        type: 'size',
        height: Math.ceil(h) + 12,
        width: Math.ceil(w)
      }));
    }
  })();
  sendSize();
  setTimeout(sendSize, 200);
  true;
`;

function buildAdditionalInfoHtml(html: string, viewportWidth: number): string {
  return `<!DOCTYPE html><html><head><meta name="viewport" content="width=${viewportWidth}, initial-scale=1, maximum-scale=1, user-scalable=no"><meta charset="utf-8"><style>
*{box-sizing:border-box}
body{margin:0;padding:4px;font-size:6px;line-height:1.4;color:#333;background:transparent;direction:ltr;text-align:left}
.wrap{overflow-x:auto;-webkit-overflow-scrolling:touch;min-height:1px;direction:ltr}
.wrap table,.wrap th,.wrap td,.wrap p,.wrap li,.wrap div,.wrap span{font-size:6px !important;line-height:1.4 !important}
.wrap table{margin:2px 0 !important;border-collapse:collapse;width:auto !important;max-width:100% !important;table-layout:auto !important}
.wrap th,.wrap td{border:1px solid #b5b5b5 !important;padding:3px 4px !important}
.wrap th{background:#253546 !important;color:#fff !important}
.wrap tr:nth-child(even) td{background:#f5f5f5 !important}
.wrap ul,.wrap ol{margin:2px 0 !important;padding-left:10px !important}
.wrap li{margin:1px 0 !important}
.wrap p{margin:2px 0 !important}
</style></head><body><div class="wrap">${html}</div></body></html>`;
}

const AdditionalInfoWebView: React.FC<{ html: string; simultaneousHandlers?: any }> = ({
  html,
  simultaneousHandlers,
}) => {
  const { width } = useWindowDimensions();
  const [contentHeight, setContentHeight] = React.useState(ADDITIONAL_INFO_WEBVIEW_MIN_HEIGHT);
  const [contentWidth, setContentWidth] = React.useState<number | null>(null);
  React.useEffect(() => {
    setContentHeight(ADDITIONAL_INFO_WEBVIEW_MIN_HEIGHT);
    setContentWidth(null);
  }, [html]);
  const viewportWidth = Math.max(320, width - 48);
  const source = useMemo(
    () => ({ html: buildAdditionalInfoHtml(html, viewportWidth) }),
    [html, viewportWidth]
  );

  const onMessage = React.useCallback((event: { nativeEvent: { data: string } }) => {
    try {
      const data = JSON.parse(event.nativeEvent.data);
      // Backward compat (older injected script)
      if (data?.type === 'height' && typeof data.height === 'number' && data.height > 0) {
        setContentHeight(Math.max(ADDITIONAL_INFO_WEBVIEW_MIN_HEIGHT, data.height));
        return;
      }

      if (data?.type === 'size') {
        if (typeof data.height === 'number' && data.height > 0) {
          setContentHeight(Math.max(ADDITIONAL_INFO_WEBVIEW_MIN_HEIGHT, data.height));
        }
        if (typeof data.width === 'number' && data.width > 0) {
          setContentWidth(data.width);
        }
      }
    } catch (_) {}
  }, []);

  const webViewWidth = Math.max(viewportWidth, contentWidth ?? viewportWidth);

  return (
    <GHScrollView
      horizontal
      showsHorizontalScrollIndicator
      nestedScrollEnabled
      simultaneousHandlers={simultaneousHandlers}
      style={[styles.additionalInfoWebViewWrap, { height: contentHeight }]}
      contentContainerStyle={{ width: webViewWidth, height: contentHeight }}
    >
      <NativeViewGestureHandler simultaneousHandlers={simultaneousHandlers} disallowInterruption={false}>
        <View style={{ width: webViewWidth, height: contentHeight }} pointerEvents="none">
          <WebView
            source={source}
            originWhitelist={['*']}
            scrollEnabled={false}
            nestedScrollEnabled={true}
            style={[styles.additionalInfoWebView, { width: webViewWidth, height: contentHeight }]}
            injectedJavaScript={INJECT_HEIGHT_SCRIPT}
            onMessage={onMessage}
          />
        </View>
      </NativeViewGestureHandler>
    </GHScrollView>
  );
};

interface TopicCardProps {
  topic: TopicData;
  studyPattern: StudyPattern;
  choiceCount: number;
  onAnswerSelected: (isCorrect: boolean) => void;
}

export const TopicCard: React.FC<TopicCardProps> = ({
  topic,
  studyPattern,
  choiceCount,
  onAnswerSelected,
}) => {
  const { topics } = useStudyStore();
  const scrollRef = React.useRef<any>(null);
  const [selectedChoice, setSelectedChoice] = React.useState<string | null>(null);
  const [showAnswer, setShowAnswer] = React.useState(false);

  // 선택지 생성 로직
  const choices = useMemo(() => {
    if (studyPattern === 'full') {
      // 전체 학습: 선택지 없이 읽기 모드
      return [];
    } else if (studyPattern === 'select_definition') {
      // 정의 선택: 토픽을 보여주고 정의를 선택
      const otherTopics = topics
        .filter((t) => t.topic !== topic.topic && t.definition)
        .sort(() => Math.random() - 0.5)
        .slice(0, choiceCount - 1);
      
      const allChoices = [
        { text: topic.definition || '', isCorrect: true },
        ...otherTopics.map((t) => ({ text: t.definition || '', isCorrect: false })),
      ].sort(() => Math.random() - 0.5);
      
      return allChoices;
    } else {
      // 토픽 찾기: 정의를 보여주고 토픽을 선택
      const otherTopics = topics
        .filter((t) => t.topic !== topic.topic)
        .sort(() => Math.random() - 0.5)
        .slice(0, choiceCount - 1);
      
      const allChoices = [topic, ...otherTopics].sort(() => Math.random() - 0.5);
      return allChoices.map((t) => t.topic);
    }
  }, [topic, topics, choiceCount, studyPattern]);

  const handleChoicePress = (choice: string | { text: string; isCorrect: boolean }) => {
    if (showAnswer) return;

    const choiceText = typeof choice === 'string' ? choice : choice.text;
    setSelectedChoice(choiceText);
    setShowAnswer(true);

    let isCorrect = false;
    if (studyPattern === 'find_topic') {
      isCorrect = choiceText === topic.topic;
    } else if (studyPattern === 'select_definition') {
      isCorrect = typeof choice === 'object' && choice.isCorrect;
    }

    setTimeout(() => {
      onAnswerSelected(isCorrect);
      setSelectedChoice(null);
      setShowAnswer(false);
    }, 1500);
  };

  const renderQuestion = () => {
    if (studyPattern === 'full') {
      // 전체 학습: 토픽과 정의를 모두 보여주기
      return (
        <View>
          <View style={styles.topicContainer}>
            <View style={styles.topicTitleRow}>
              <Text style={styles.topicTitle}>{topic.topic}</Text>
              <Text style={[styles.importanceBadge, { color: getImportanceColor(topic.importance) }]}>
                ({getImportanceText(topic.importance)})
              </Text>
            </View>
            {topic.topics_eng && (
              <Text style={styles.topicEng}>{topic.topics_eng}</Text>
            )}
            {topic.topics_loc && (
              <Text style={styles.topicLoc}>{topic.topics_loc}</Text>
            )}
          </View>
          {topic.definition && (
            <View style={styles.questionContainer}>
              <Text style={styles.questionLabel}>정의:</Text>
              <Text style={styles.questionText}>{topic.definition}</Text>
            </View>
          )}
        </View>
      );
    } else if (studyPattern === 'find_topic') {
      return (
        <View style={styles.questionContainer}>
          <Text style={styles.questionLabel}>정의:</Text>
          <Text style={styles.questionText}>{topic.definition || '정의가 없습니다.'}</Text>
        </View>
      );
    } else {
      return (
        <View style={styles.questionContainer}>
          <Text style={styles.questionLabel}>토픽:</Text>
          <Text style={styles.questionText}>{topic.topic}</Text>
        </View>
      );
    }
  };

  const getImportanceColor = (importance: string) => {
    if (importance === '상' || importance === 'high' || importance === 'HIGH') {
      return '#F44336'; // 빨간색
    } else if (importance === '중' || importance === 'medium' || importance === 'MEDIUM') {
      return '#FF9800'; // 주황색
    } else {
      return '#4CAF50'; // 초록색
    }
  };

  const getImportanceText = (importance: string) => {
    if (importance === '상' || importance === 'high' || importance === 'HIGH') {
      return '상';
    } else if (importance === '중' || importance === 'medium' || importance === 'MEDIUM') {
      return '중';
    } else {
      return '하';
    }
  };

  return (
    <GHScrollView
      ref={scrollRef}
      style={styles.container}
      contentContainerStyle={styles.contentContainer}
      showsVerticalScrollIndicator={true}
      bounces={true}
      removeClippedSubviews={false}
      nestedScrollEnabled
    >
      <View style={styles.header}>
        <Text style={styles.categoryPath}>
          {topic.category_l1}
          {topic.category_l2 && ` > ${topic.category_l2}`}
        </Text>
      </View>

      {renderQuestion()}

      {studyPattern !== 'full' && (
        <View style={styles.choicesContainer}>
          {choices.map((choice, index) => {
            const choiceText = typeof choice === 'string' ? choice : choice.text;
            const isCorrect =
              studyPattern === 'select_definition'
                ? typeof choice === 'object' && choice.isCorrect
                : choiceText === topic.topic;

            return (
              <ChoiceButton
                key={index}
                label={choiceText}
                onPress={() => handleChoicePress(choice)}
                isCorrect={isCorrect}
                isSelected={selectedChoice === choiceText}
                disabled={showAnswer}
              />
            );
          })}
        </View>
      )}


      {topic.cheatsheet && (
        <View style={styles.cheatsheetContainer}>
          <Text style={styles.cheatsheetLabel}>요약:</Text>
          <Text style={styles.cheatsheetText}>{topic.cheatsheet}</Text>
        </View>
      )}

      {topic.additional_info && (
        <View style={styles.additionalInfoContainer}>
          <Text style={styles.additionalInfoLabel}>추가 정보:</Text>
          <AdditionalInfoWebView html={topic.additional_info} simultaneousHandlers={scrollRef} />
        </View>
      )}

      {topic.viewtable && (
        <View style={styles.viewtableContainer}>
          <Text style={styles.viewtableLabel}>비교표:</Text>
          <GHScrollView
            horizontal
            showsHorizontalScrollIndicator
            style={styles.viewtableScroll}
            contentContainerStyle={styles.viewtableScrollContent}
            nestedScrollEnabled
          >
            <View style={[styles.viewtableInner, { width: VIEWTABLE_SCROLL_WIDTH, minWidth: VIEWTABLE_SCROLL_WIDTH }]}>
              <Text style={styles.viewtableText}>{topic.viewtable}</Text>
            </View>
          </GHScrollView>
        </View>
      )}
    </GHScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  contentContainer: {
    padding: 12,
    paddingBottom: 32,
  },
  header: {
    marginBottom: 8,
    paddingBottom: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  categoryPath: {
    fontSize: 13,
    color: '#666',
  },
  questionContainer: {
    marginBottom: 10,
    padding: 10,
    backgroundColor: '#F5F5F5',
    borderRadius: 6,
  },
  topicContainer: {
    marginBottom: 10,
    padding: 10,
    backgroundColor: '#F5F5F5',
    borderRadius: 6,
  },
  questionLabel: {
    fontSize: 13,
    fontWeight: '600',
    color: '#666',
    marginBottom: 6,
  },
  questionText: {
    fontSize: 14,
    color: '#333',
    lineHeight: 19,
  },
  choicesContainer: {
    marginBottom: 12,
  },
  cheatsheetContainer: {
    marginTop: 12,
    padding: 10,
    backgroundColor: '#E3F2FD',
    borderRadius: 6,
  },
  cheatsheetLabel: {
    fontSize: 13,
    fontWeight: '600',
    color: '#1976D2',
    marginBottom: 6,
  },
  cheatsheetText: {
    fontSize: 14,
    color: '#333',
    lineHeight: 19,
  },
  additionalInfoContainer: {
    marginTop: 8,
    marginBottom: 12,
    padding: 6,
    backgroundColor: '#FFF3E0',
    borderRadius: 6,
  },
  additionalInfoLabel: {
    fontSize: 10,
    fontWeight: '600',
    color: '#F57C00',
    marginBottom: 2,
  },
  additionalInfoText: {
    fontSize: 10,
    color: '#333',
    lineHeight: 14,
  },
  additionalInfoWebViewWrap: {
    width: '100%',
    overflow: 'hidden',
    borderRadius: 4,
  },
  additionalInfoWebView: {
    backgroundColor: 'transparent',
    width: '100%',
  },
  viewtableContainer: {
    marginTop: 6,
    marginBottom: 12,
    padding: 6,
    backgroundColor: '#FFF3E0',
    borderRadius: 6,
  },
  viewtableLabel: {
    fontSize: 8,
    fontWeight: '600',
    color: '#F57C00',
    marginBottom: 2,
  },
  viewtableText: {
    fontSize: 8,
    fontWeight: '500',
    color: '#333',
    lineHeight: 11,
  },
  viewtableScroll: {
    marginTop: 2,
    minHeight: 40,
  },
  viewtableScrollContent: {
    paddingRight: 16,
  },
  viewtableInner: {
    paddingRight: 6,
    flexShrink: 0,
  },
  topicTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
    marginBottom: 2,
  },
  topicTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginRight: 6,
  },
  importanceBadge: {
    fontSize: 14,
    fontWeight: 'bold',
  },
  topicEng: {
    fontSize: 14,
    color: '#666',
    marginBottom: 1,
    fontStyle: 'italic',
  },
  topicLoc: {
    fontSize: 13,
    color: '#999',
  },
});
