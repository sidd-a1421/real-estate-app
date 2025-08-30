import { Link } from "expo-router";
import { Text, View } from "react-native";

export default function Index() {
  return (
    <View
      style={{
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
      }}
    >
      <Text className="text-blue-500 text-3xl font-bold font-rubik">Welcome to ReState</Text>
      {/* <Link href='/sign-in'>Signin</Link> */}
    </View>
  );
}
