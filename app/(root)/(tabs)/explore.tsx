import { Card, FetureCard, Filters, NoResult, Search } from "@/components";
import icons from "@/constants/icons";
import { getLatestProperties, getproperties } from "@/lib/appwrite";
import { useGlobalContext } from "@/lib/global-provider";
import { useAppwrite } from "@/lib/useAppwrite";
import { Redirect, router, useLocalSearchParams } from "expo-router";
import { useEffect } from "react";
import { ActivityIndicator, FlatList, Image, Text, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function Explore() {

  const params = useLocalSearchParams<{ query?: string; filter?: string }>();

  const {data: properties, loading, refetch} = useAppwrite({
    fn: getproperties,
    params: {
      filter: params.filter!,
      query: params.query!,
      limit: 20
    },
    skip: true
  })

  const handleCardPress = (id: string) => router.push(`/properties/${id}`)

  useEffect(() => {
    refetch({
      filter: params.filter!,
      query: params.query!,
      limit: 20
    });
  },[params.filter, params.query])


  return (
    <SafeAreaView className="bg-white h-full">
      <FlatList
        data={properties}
        renderItem={({item}) => <Card onPress={() => handleCardPress(item.$id)} item={item} />}
        keyExtractor={(item) => item.$id}
        numColumns={2}
        contentContainerClassName="pb-32"
        columnWrapperClassName="flex gap-5 px-5"
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          loading ? (
            <ActivityIndicator size='large' className="text-pink-300 mt-5" />
          ) : <NoResult />
        }
        ListHeaderComponent={() => (
          <View className="px-5">

            <View className="flex flex-row items-center justify-between mt-5">
              <TouchableOpacity onPress={() => router.back()} className="flex flex-row bg-primary-200 rounded-full items-center justify-center size-11">
                <Image source={icons.backArrow} className="size-5" />
              </TouchableOpacity>

              <Text className="text-base mr-2 font-rubik-medium text-center text-black-300">Search for Your Ideal Home</Text>

              <Image source={icons.bell} className="w-6 h-6" />

            </View>

            <Search />
            <View className="mt-5">
              <Filters />
              <Text className="text-xl font-rubik-bold text-black-300 mt-5">
                Found {properties?.length} Apartments
              </Text>
            </View>
          </View>
        )}
      />
    </SafeAreaView>
  );
}
