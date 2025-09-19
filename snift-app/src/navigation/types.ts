import { NavigatorScreenParams } from '@react-navigation/native';

// Root Stack Navigator Types
export type RootStackParamList = {
  Home: undefined;
  Login: undefined;
  Register: undefined;
  Main: NavigatorScreenParams<MainTabParamList>;
};

// Main Tab Navigator Types
export type MainTabParamList = {
  Dating: NavigatorScreenParams<DatingStackParamList>;
  Matches: NavigatorScreenParams<MatchesStackParamList>;
  Requests: NavigatorScreenParams<RequestsStackParamList>;
  Chat: NavigatorScreenParams<ChatStackParamList>;
  Profile: NavigatorScreenParams<ProfileStackParamList>;
};

// Dating Stack Types
export type DatingStackParamList = {
  DatingScreen: undefined;
  ProfileDetailScreen: { profileId: string };
};


// Matches Stack Types
export type MatchesStackParamList = {
  MatchesScreen: undefined;
  MatchDetailScreen: { matchId: string };
  ProfileDetailScreen: { profileId: string };
};

// Requests Stack Types
export type RequestsStackParamList = {
  RequestsScreen: undefined;
  RequestDetailScreen: { requestId: string };
  ProfileDetailScreen: { profileId: string };
};

// Chat Stack Types
export type ChatStackParamList = {
  ChatListScreen: undefined;
  ChatThreadScreen: { chatId: string; userName: string };
};

// Profile Stack Types
export type ProfileStackParamList = {
  ProfileScreen: undefined;
  EditProfileScreen: undefined;
  ProfileDetailScreen: { profileId: string };
  PacksScreen: undefined;
  AdminScreen: undefined;
  PerformanceTestScreen: undefined;
};

// Declare global types for React Navigation
declare global {
  namespace ReactNavigation {
    interface RootParamList extends RootStackParamList {}
  }
}
