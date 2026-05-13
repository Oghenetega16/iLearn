// mobile/app/search-users.tsx
import { View, Text, TextInput, TouchableOpacity, FlatList, KeyboardAvoidingView, Platform, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useUserSearch } from '../hooks/chat/useUserSearch';

export default function SearchUsersScreen() {
  const { state, setters } = useUserSearch();

  const handleStartChat = (userId: string, userName: string) => {
    // Dismiss the modal and instantly push the chat screen
    router.replace({
      pathname: '/chat/[id]',
      params: { id: userId, name: userName }
    });
  };

  return (
    <SafeAreaView className="flex-1 bg-brand-background">
      {/* Modal Header */}
      <View className="flex-row items-center justify-between px-6 py-4 bg-white border-b border-gray-100">
        <Text className="text-xl font-kumbh-bold text-brand-dark">Find Study Partners</Text>
        <TouchableOpacity 
          onPress={() => router.back()} 
          className="items-center justify-center w-10 h-10 bg-gray-100 rounded-full"
        >
          <Ionicons name="close" size={20} color="#091413" />
        </TouchableOpacity>
      </View>

      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} className="flex-1">
        
        {/* Search Input */}
        <View className="px-6 py-4 bg-white">
          <View className="flex-row items-center h-12 px-4 border border-gray-200 shadow-sm bg-gray-50 rounded-2xl">
            <Ionicons name="search-outline" size={20} color="#8E8E93" />
            <TextInput 
              value={state.searchQuery}
              onChangeText={setters.setSearchQuery}
              autoFocus={true}
              placeholder="Search by name..." 
              placeholderTextColor="#8E8E93"
              className="flex-1 ml-3 text-base font-manrope text-brand-dark"
            />
            {state.loading ? (
              <ActivityIndicator size="small" color="#285A48" />
            ) : state.searchQuery.length > 0 ? (
              <TouchableOpacity onPress={() => setters.setSearchQuery('')}>
                <Ionicons name="close-circle" size={20} color="#8E8E93" />
              </TouchableOpacity>
            ) : null}
          </View>
        </View>

        {/* Filter Tabs */}
        <View className="flex-row px-6 pb-4 bg-white border-b border-gray-100">
          {['all', 'students', 'tutors'].map((tab) => (
            <TouchableOpacity 
              key={tab}
              onPress={() => setters.setActiveTab(tab as any)}
              className={`px-4 py-2 mr-3 rounded-full border ${
                state.activeTab === tab 
                  ? 'bg-brand-primary border-brand-primary' 
                  : 'bg-white border-gray-200'
              }`}
            >
              <Text className={`text-sm font-manrope-bold capitalize ${
                state.activeTab === tab ? 'text-white' : 'text-brand-secondary'
              }`}>
                {tab}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Results List */}
        <FlatList
          data={state.users}
          keyExtractor={(item) => item.id}
          contentContainerStyle={{ padding: 24 }}
          showsVerticalScrollIndicator={false}
          ListEmptyComponent={
            !state.loading ? (
              <View className="items-center justify-center mt-12">
                <View className="items-center justify-center w-20 h-20 mb-4 bg-gray-100 rounded-full">
                  <Ionicons 
                    name={state.searchQuery.length > 0 ? "search" : "people-outline"} 
                    size={32} 
                    color="#8E8E93" 
                  />
                </View>
                <Text className="text-base text-center font-manrope-bold text-brand-dark">
                  {state.searchQuery.length > 0 ? 'No users found' : 'Search for study partners'}
                </Text>
                <Text className="mt-1 text-sm text-center font-manrope text-brand-secondary">
                  {state.searchQuery.length > 0 
                    ? 'Try adjusting your search or filters' 
                    : 'Type a name above to find someone to chat with'}
                </Text>
              </View>
            ) : null
          }
          renderItem={({ item }) => (
            <View className="flex-row items-center p-4 mb-3 bg-white border border-gray-100 shadow-sm rounded-3xl">
              
              <View className="relative mr-4">
                <View className="items-center justify-center w-12 h-12 bg-gray-100 border border-gray-200 rounded-full">
                  <Ionicons name={item.icon as any} size={20} color="#8E8E93" />
                </View>
                {/* Role Badge */}
                <View className={`absolute -bottom-1 -right-1 w-5 h-5 rounded-full items-center justify-center border-2 border-white ${item.role === 'tutor' ? 'bg-amber-500' : 'bg-brand-primary'}`}>
                  <Ionicons name={item.role === 'tutor' ? 'school' : 'book'} size={10} color="#FFF" />
                </View>
              </View>

              <View className="flex-1 pr-2">
                <Text className="text-base font-kumbh-bold text-brand-dark" numberOfLines={1}>{item.name}</Text>
                <Text className="text-xs font-manrope text-brand-secondary" numberOfLines={1}>{item.bio}</Text>
              </View>

              <TouchableOpacity 
                onPress={() => handleStartChat(item.id, item.name)}
                className="items-center justify-center px-4 py-2 bg-brand-light rounded-xl"
              >
                <Text className="text-sm font-kumbh-bold text-brand-primary">Message</Text>
              </TouchableOpacity>
            </View>
          )}
        />
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}