import 'react-native-gesture-handler';
import React, { Component, ErrorInfo, ReactNode } from 'react';
import { StatusBar } from 'expo-status-bar';
import { AppNavigator } from './src/navigation/AppNavigator';
import { PaperProvider } from 'react-native-paper';
import { View, Text, StyleSheet, LogBox } from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';

// React Native LogBox 설정 (표준 디버깅 방법)
// 모든 경고와 에러를 터미널에 표시
LogBox.ignoreLogs([
  // 특정 경고를 무시하려면 여기에 추가 (예: 'Non-serializable values were found')
]);

// 개발 모드에서 LogBox 활성화
if (__DEV__) {
  LogBox.ignoreAllLogs(false);
  
  // YellowBox 대신 LogBox 사용 (React Native 0.63+)
  console.log('🔍 LogBox 활성화됨 - 모든 에러와 경고가 터미널에 표시됩니다');
}

// 전역 에러 핸들러 설정 (React Native 표준 방법)
if (typeof ErrorUtils !== 'undefined') {
  const originalHandler = ErrorUtils.getGlobalHandler();
  ErrorUtils.setGlobalHandler((error, isFatal) => {
    // 터미널에 에러 출력 (개발자들이 가장 많이 사용하는 방법)
    console.error('\n❌ ========== 전역 에러 발생 ==========');
    console.error('📱 에러 메시지:', error.message);
    console.error('📍 스택 트레이스:', error.stack);
    console.error('⚠️  치명적 에러:', isFatal);
    console.error('📦 에러 타입:', error.name);
    
    // 에러 객체의 모든 속성 출력
    try {
      const errorDetails = {
        message: error.message,
        stack: error.stack,
        name: error.name,
        ...(error as any),
      };
      console.error('🔍 상세 정보:', JSON.stringify(errorDetails, null, 2));
    } catch (e) {
      console.error('🔍 에러 객체:', error);
    }
    console.error('========================================\n');
    
    // 원래 핸들러도 호출 (기본 에러 처리 유지)
    if (originalHandler) {
      originalHandler(error, isFatal);
    }
  });
}

// Promise rejection 핸들러 (비동기 에러 캐치)
if (typeof global !== 'undefined') {
  const originalUnhandledRejection = (global as any).onunhandledrejection;
  (global as any).onunhandledrejection = (event: any) => {
    console.error('\n❌ ========== Promise Rejection 발생 ==========');
    console.error('📱 에러:', event?.reason);
    if (event?.reason?.message) {
      console.error('📝 메시지:', event.reason.message);
    }
    if (event?.reason?.stack) {
      console.error('📍 스택:', event.reason.stack);
    }
    console.error('==============================================\n');
    
    if (originalUnhandledRejection && typeof originalUnhandledRejection === 'function') {
      originalUnhandledRejection.call(global, event);
    }
  };
}

// ErrorBoundary 클래스 컴포넌트
interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
}

class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
    };
  }

  static getDerivedStateFromError(error: Error): State {
    return {
      hasError: true,
      error,
      errorInfo: null,
    };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    // ErrorBoundary에서 캐치한 에러를 터미널에 출력
    console.error('\n❌ ========== ErrorBoundary에서 에러 캐치 ==========');
    console.error('📱 에러 메시지:', error.message);
    console.error('📍 스택 트레이스:', error.stack);
    console.error('🧩 컴포넌트 스택:', errorInfo.componentStack);
    
    try {
      const errorDetails = {
        ...error,
        message: error.message,
        stack: error.stack,
        name: error.name,
      };
      console.error('🔍 전체 에러 객체:', JSON.stringify(errorDetails, Object.getOwnPropertyNames(error), 2));
    } catch (e) {
      console.error('🔍 에러 객체:', error);
    }
    console.error('==================================================\n');

    this.setState({
      error,
      errorInfo,
    });
  }

  render() {
    if (this.state.hasError) {
      return (
        <View style={styles.errorContainer}>
          <Text style={styles.errorTitle}>에러가 발생했습니다</Text>
          <Text style={styles.errorMessage}>
            {this.state.error?.message || '알 수 없는 에러'}
          </Text>
          {this.state.error?.stack && (
            <Text style={styles.errorStack}>{this.state.error.stack}</Text>
          )}
          {this.state.errorInfo?.componentStack && (
            <Text style={styles.errorStack}>
              {this.state.errorInfo.componentStack}
            </Text>
          )}
          <Text style={styles.errorHint}>
            터미널에서 자세한 에러 로그를 확인하세요.
          </Text>
        </View>
      );
    }

    return this.props.children;
  }
}

export default function App() {
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <ErrorBoundary>
        <PaperProvider>
          <AppNavigator />
          <StatusBar style="auto" />
        </PaperProvider>
      </ErrorBoundary>
    </GestureHandlerRootView>
  );
}

const styles = StyleSheet.create({
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
    backgroundColor: '#fff',
  },
  errorTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#F44336',
    marginBottom: 10,
  },
  errorMessage: {
    fontSize: 16,
    color: '#666',
    marginBottom: 20,
    textAlign: 'center',
  },
  errorStack: {
    fontSize: 12,
    color: '#999',
    marginBottom: 20,
    fontFamily: 'monospace',
  },
  errorHint: {
    fontSize: 14,
    color: '#2196F3',
    textAlign: 'center',
  },
});
