// Mock environment variables
process.env.EXPO_PUBLIC_SUPABASE_URL = "https://test.supabase.co";
process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY = "test-anon-key";

// Global fetch mock to prevent real network calls
global.fetch = jest.fn(() =>
  Promise.resolve({
    ok: true,
    json: () => Promise.resolve({}),
  })
);

// Mock nanoid module
jest.mock("nanoid/non-secure", () => ({
  nanoid: () => "mock-id-" + Math.random().toString(36).substr(2, 9),
}));

// Mock AsyncStorage FIRST - before any imports
const mockAsyncStorage = {
  getItem: jest.fn(() => Promise.resolve(null)),
  setItem: jest.fn(() => Promise.resolve()),
  removeItem: jest.fn(() => Promise.resolve()),
  clear: jest.fn(() => Promise.resolve()),
  getAllKeys: jest.fn(() => Promise.resolve([])),
  multiGet: jest.fn(() => Promise.resolve([])),
  multiSet: jest.fn(() => Promise.resolve()),
  multiRemove: jest.fn(() => Promise.resolve()),
};

jest.mock("@react-native-async-storage/async-storage", () => mockAsyncStorage);

// Mock components
jest.mock("@/components/themed-text", () => ({
  ThemedText: ({ children, ...props }) => children,
}));

jest.mock("@/components/themed-todo-row-view", () => ({
  ThemedTodoRowView: ({ text }) => text,
}));

jest.mock("@/hooks/use-theme-color", () => ({
  useThemeColor: jest.fn(() => "#ffffff"),
}));

// Mock React Native modules
jest.mock("react-native", () => ({
  Platform: {
    OS: "ios",
    select: function(obj) {
      return obj.ios;
    },
  },
  View: "View",
  Text: "Text",
  StyleSheet: {
    create: (styles) => styles,
    flatten: (style) => style,
  },
  FlatList: "FlatList",
  TextInput: "TextInput",
  Pressable: "Pressable",
  TouchableOpacity: "TouchableOpacity",
}));

// Mock Supabase - MUST be done before any imports of lib/supabase
jest.mock("@supabase/supabase-js", () => ({
  createClient: jest.fn(() => ({
    auth: {
      getSession: jest.fn(),
      signInAnonymously: jest.fn(),
    },
    from: jest.fn(),
  })),
}));

// Mock expo-symbols
jest.mock("expo-symbols", () => ({
  SymbolView: "SymbolView",
}));

// Mock react-native-safe-area-context
jest.mock("react-native-safe-area-context", () => ({
  SafeAreaView: ({ children }) => children,
}));

