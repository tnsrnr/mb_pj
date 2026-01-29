import React, { forwardRef, useImperativeHandle, useEffect } from 'react';
import { StyleSheet, ViewStyle, StyleProp, Dimensions } from 'react-native';
import { GestureDetector, Gesture } from 'react-native-gesture-handler';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  runOnJS,
  Easing,
  cancelAnimation,
} from 'react-native-reanimated';
import { SWIPE_THRESHOLD } from '../utils/constants';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const EXIT_DISTANCE = SCREEN_WIDTH;

const SMOOTH_DURATION = 280;
const SMOOTH_EASING = Easing.out(Easing.cubic);
const EXIT_DURATION = 260;

export type SwipeDirection = 'left' | 'right';

interface SwipeableCardProps {
  children: React.ReactNode;
  onSwipeLeft?: () => void;
  onSwipeRight?: () => void;
  /** 커밋 시 "나감 + 들어옴" 전환 사용. 비우면 기존 스냅백 방식 */
  onSwipeCommit?: (direction: SwipeDirection) => void;
  onExitAnimationEnd?: () => void;
  canSwipeLeft?: boolean;
  canSwipeRight?: boolean;
  style?: StyleProp<ViewStyle>;
}

export interface SwipeableCardRef {
  resetPosition: () => void;
}

export const SwipeableCard = forwardRef<SwipeableCardRef, SwipeableCardProps>(
  function SwipeableCard(
    {
      children,
      onSwipeLeft,
      onSwipeRight,
      onSwipeCommit,
      onExitAnimationEnd,
      canSwipeLeft = true,
      canSwipeRight = true,
      style,
    },
    ref
  ) {
    const translateX = useSharedValue(0);
    const canLeft = useSharedValue(canSwipeLeft);
    const canRight = useSharedValue(canSwipeRight);
    const useCommitFlow = Boolean(onSwipeCommit);

    useEffect(() => {
      canLeft.value = canSwipeLeft;
      canRight.value = canSwipeRight;
    }, [canSwipeLeft, canSwipeRight]);

    const panGesture = Gesture.Pan()
      .activeOffsetX([-12, 12])
      .failOffsetY([-18, 18])
      .onUpdate((event) => {
        translateX.value = event.translationX;
      })
      .onEnd((event) => {
        const tx = event.translationX;
        const allowLeft = useCommitFlow ? canLeft.value : Boolean(onSwipeLeft);
        const allowRight = useCommitFlow ? canRight.value : Boolean(onSwipeRight);
        const goLeft = tx < -SWIPE_THRESHOLD && allowLeft && (useCommitFlow ? onSwipeCommit : onSwipeLeft);
        const goRight = tx > SWIPE_THRESHOLD && allowRight && (useCommitFlow ? onSwipeCommit : onSwipeRight);

        if (goRight) {
          if (useCommitFlow && onSwipeCommit) {
            runOnJS(onSwipeCommit)('right');
            translateX.value = withTiming(
              EXIT_DISTANCE,
              {
                duration: EXIT_DURATION,
                easing: SMOOTH_EASING,
                isInteraction: false,
              },
              (finished) => {
                if (finished && onExitAnimationEnd) runOnJS(onExitAnimationEnd)();
              }
            );
          } else if (onSwipeRight) {
            runOnJS(onSwipeRight)();
            translateX.value = withTiming(0, {
              duration: SMOOTH_DURATION,
              easing: SMOOTH_EASING,
              isInteraction: false,
            });
          }
          return;
        }

        if (goLeft) {
          if (useCommitFlow && onSwipeCommit) {
            runOnJS(onSwipeCommit)('left');
            translateX.value = withTiming(
              -EXIT_DISTANCE,
              {
                duration: EXIT_DURATION,
                easing: SMOOTH_EASING,
                isInteraction: false,
              },
              (finished) => {
                if (finished && onExitAnimationEnd) runOnJS(onExitAnimationEnd)();
              }
            );
          } else if (onSwipeLeft) {
            runOnJS(onSwipeLeft)();
            translateX.value = withTiming(0, {
              duration: SMOOTH_DURATION,
              easing: SMOOTH_EASING,
              isInteraction: false,
            });
          }
          return;
        }

        translateX.value = withTiming(0, {
          duration: SMOOTH_DURATION,
          easing: SMOOTH_EASING,
          isInteraction: false,
        });
      });

    const animatedStyle = useAnimatedStyle(() => ({
      transform: [{ translateX: Math.round(translateX.value) }],
    }));

    useImperativeHandle(ref, () => ({
      resetPosition() {
        cancelAnimation(translateX);
        translateX.value = 0;
      },
    }));

    return (
      <GestureDetector gesture={panGesture}>
        <Animated.View style={[styles.card, style, animatedStyle]}>
          {children}
        </Animated.View>
      </GestureDetector>
    );
  }
);

const styles = StyleSheet.create({
  card: {
    flex: 1,
  },
});
