import { LogBox, View, Text, StatusBar } from "react-native";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { useFonts } from "expo-font";
import { PlusJakartaSans_400Regular, PlusJakartaSans_600SemiBold, PlusJakartaSans_700Bold } from "@expo-google-fonts/plus-jakarta-sans";
import { Fraunces_400Regular, Fraunces_600SemiBold, Fraunces_700Bold } from "@expo-google-fonts/fraunces";
import { FontPreferenceProvider } from "./src/theme/fontPreferences";
import { TutorVoiceControls } from "./src/components/TutorVoiceControls";
LogBox.ignoreAllLogs(true);
export default function VoiceCallRecording() {
  const [ready] = useFonts({ PlusJakartaSans_400Regular, PlusJakartaSans_600SemiBold, PlusJakartaSans_700Bold, Fraunces_400Regular, Fraunces_600SemiBold, Fraunces_700Bold });
  if (!ready) return <View style={{ flex: 1, backgroundColor: "#071020" }} />;
  return <SafeAreaProvider><FontPreferenceProvider><View style={{ flex: 1, backgroundColor: "#071020", padding: 28, paddingTop: 90 }}>
    <StatusBar barStyle="light-content" />
    <Text style={{ color: "#F2F4FF", fontFamily: "PlusJakartaSans_700Bold", fontSize: 24 }}>Luna Tutor</Text>
    <Text style={{ color: "#A9B5D0", fontFamily: "PlusJakartaSans_400Regular", fontSize: 17, marginTop: 24 }}>Solve 3x + 5 = 20</Text>
    <TutorVoiceControls accentColor="#77DACA" disabled={false} showLiveButton={false} visible resetKey="website-sample" tutorName="Luna" messages={[]}
      conversation={{ kind: "home" }} onBeforeStart={() => false} onTranscribed={() => {}} onConversation={() => {}} onBusyChange={() => {}} />
  </View></FontPreferenceProvider></SafeAreaProvider>;
}
