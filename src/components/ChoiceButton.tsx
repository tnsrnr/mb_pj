import React from 'react';
import { TouchableOpacity, Text, StyleSheet, View } from 'react-native';
import { useTheme } from 'react-native-paper';

interface ChoiceButtonProps {
  label: string;
  subtitle?: string;
  onPress: () => void;
  isCorrect?: boolean;
  isSelected?: boolean;
  disabled?: boolean;
  variant?: 'default' | 'topicChoice';
}

export const ChoiceButton: React.FC<ChoiceButtonProps> = ({
  label,
  subtitle,
  onPress,
  isCorrect,
  isSelected,
  disabled,
  variant = 'default',
}) => {
  const theme = useTheme();
  const isTopicChoice = variant === 'topicChoice';

  const getButtonStyle = () => {
    const base = isTopicChoice ? styles.topicChoiceButton : styles.button;
    if (disabled && isSelected) {
      return isCorrect
        ? [base, styles.correctButton, { backgroundColor: '#4CAF50' }]
        : [base, styles.incorrectButton, { backgroundColor: '#F44336' }];
    }
    return [
      base,
      isSelected && { backgroundColor: theme.colors.primary },
    ];
  };

  const getTextStyle = () => {
    const base = isTopicChoice ? styles.topicChoiceLabel : styles.buttonText;
    if (disabled && isSelected) {
      return [base, styles.selectedText];
    }
    return [
      base,
      isSelected && { color: '#fff' },
    ];
  };

  const getSubtitleStyle = () => {
    if (!subtitle) return null;
    return [
      styles.subtitleText,
      isSelected && { color: '#fff' },
      disabled && isSelected && styles.selectedText,
    ];
  };

  return (
    <TouchableOpacity
      style={getButtonStyle()}
      onPress={onPress}
      disabled={disabled}
      activeOpacity={0.7}
    >
      {subtitle ? (
        <View style={styles.textWrap}>
          <Text style={getTextStyle()}>{label}</Text>
          <Text style={getSubtitleStyle()}>{subtitle}</Text>
        </View>
      ) : (
        <Text style={getTextStyle()}>{label}</Text>
      )}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  button: {
    padding: 4,
    marginVertical: 2,
    borderRadius: 4,
    borderWidth: 1,
    borderColor: '#E0E0E0',
    backgroundColor: '#fff',
    minHeight: 28,
    justifyContent: 'center',
    alignItems: 'center',
  },
  topicChoiceButton: {
    paddingVertical: 2,
    paddingHorizontal: 4,
    marginVertical: 1,
    borderRadius: 4,
    borderWidth: 1,
    borderColor: '#E0E0E0',
    backgroundColor: '#fff',
    minHeight: 36,
    justifyContent: 'center',
    alignItems: 'flex-start',
  },
  correctButton: {
    borderColor: '#4CAF50',
  },
  incorrectButton: {
    borderColor: '#F44336',
  },
  buttonText: {
    fontSize: 7,
    color: '#333',
    textAlign: 'center',
  },
  topicChoiceLabel: {
    fontSize: 15,
    color: '#333',
    textAlign: 'left',
  },
  subtitleText: {
    marginTop: 1,
    fontSize: 12,
    color: '#666',
    textAlign: 'left',
  },
  selectedText: {
    color: '#fff',
    fontWeight: 'bold',
  },
  textWrap: {
    alignSelf: 'stretch',
  },
});
