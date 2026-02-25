import React from 'react';
import { TouchableOpacity, Text, StyleSheet } from 'react-native';
import { useTheme } from 'react-native-paper';

interface ChoiceButtonProps {
  label: string;
  onPress: () => void;
  isCorrect?: boolean;
  isSelected?: boolean;
  disabled?: boolean;
}

export const ChoiceButton: React.FC<ChoiceButtonProps> = ({
  label,
  onPress,
  isCorrect,
  isSelected,
  disabled,
}) => {
  const theme = useTheme();

  const getButtonStyle = () => {
    if (disabled && isSelected) {
      return isCorrect
        ? [styles.button, styles.correctButton, { backgroundColor: '#4CAF50' }]
        : [styles.button, styles.incorrectButton, { backgroundColor: '#F44336' }];
    }
    return [
      styles.button,
      isSelected && { backgroundColor: theme.colors.primary },
    ];
  };

  const getTextStyle = () => {
    if (disabled && isSelected) {
      return [styles.buttonText, styles.selectedText];
    }
    return [
      styles.buttonText,
      isSelected && { color: '#fff' },
    ];
  };

  return (
    <TouchableOpacity
      style={getButtonStyle()}
      onPress={onPress}
      disabled={disabled}
      activeOpacity={0.7}
    >
      <Text style={getTextStyle()}>{label}</Text>
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
  selectedText: {
    color: '#fff',
    fontWeight: 'bold',
  },
});
