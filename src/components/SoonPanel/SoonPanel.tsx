import { Flex, Text } from '@chakra-ui/react';

interface SoonPanelProps {
  label?: string;
  color?: string;
}

export function SoonPanel({ label = 'soon', color = 'textOverlayDim' }: SoonPanelProps) {
  return (
    <Flex
      minH="200px"
      align="center"
      justify="center"
      borderRadius="12px"
    >
      <Text
        color={color}
        border="1px solid"
        borderColor={color}
        borderRadius="full"
        px="lg"
        py="xs"
        fontSize="sm"
        fontWeight="light"
        letterSpacing="widest"
        textTransform="uppercase"
      >
        {label}
      </Text>
    </Flex>
  );
}
