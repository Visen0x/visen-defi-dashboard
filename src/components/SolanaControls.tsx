import React from 'react';
import { Box, Text, Flex, Badge } from '@chakra-ui/react';
import { DataService } from '../services/dataService';

interface SolanaControlsProps {
  useLiveData: boolean;
  onToggleLiveData: (enabled: boolean) => void;
  connectionStatus: 'connected' | 'disconnected' | 'connecting';
}

const SolanaControls: React.FC<SolanaControlsProps> = ({
  useLiveData,
  onToggleLiveData,
  connectionStatus
}) => {
  const getStatusColor = () => {
    switch (connectionStatus) {
      case 'connected': return 'green';
      case 'connecting': return 'yellow';
      case 'disconnected': return 'red';
      default: return 'gray';
    }
  };

  const getStatusText = () => {
    switch (connectionStatus) {
      case 'connected': return 'Solana Connected';
      case 'connecting': return 'Connecting...';
      case 'disconnected': return 'Using Mock Data';
      default: return 'Unknown';
    }
  };

  return (
    <Box
      position="fixed"
      top="20px"
      right="20px"
      zIndex={1000}
      bg="rgba(20, 20, 20, 0.95)"
      borderRadius="12px"
      border="1px solid rgba(58, 255, 115, 0.2)"
      p={4}
      backdropFilter="blur(10px)"
    >
      <Flex direction="column" gap={3}>
        <Flex align="center" gap={3}>
          <Text fontSize="sm" color="white" fontWeight="medium">
            Live Solana Data
          </Text>
          <Box
            as="button"
            onClick={() => onToggleLiveData(!useLiveData)}
            w="40px"
            h="20px"
            bg={useLiveData ? "#3AFF73" : "gray.600"}
            borderRadius="full"
            position="relative"
            transition="all 0.2s"
            cursor="pointer"
          >
            <Box
              w="16px"
              h="16px"
              bg="white"
              borderRadius="full"
              position="absolute"
              top="2px"
              left={useLiveData ? "22px" : "2px"}
              transition="all 0.2s"
            />
          </Box>
        </Flex>
        
        <Flex align="center" gap={2}>
          <Badge
            colorScheme={getStatusColor()}
            variant="solid"
            fontSize="xs"
            px={2}
            py={1}
            borderRadius="6px"
          >
            {getStatusText()}
          </Badge>
          
          {useLiveData && (
            <Text 
              fontSize="xs" 
              color="gray.400" 
              cursor="help"
              title="Uses QuickNode Solana API to fetch real blockchain data. Falls back to mock data if API is unavailable."
            >
              ℹ️
            </Text>
          )}
        </Flex>
      </Flex>
    </Box>
  );
};

export default SolanaControls; 